package auth

import (
	"encoding/json"
	"net/http"
	"time"

	"qed-hub-backend/internal/domain/session"
	"qed-hub-backend/internal/domain/user"
)

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request format")
		return
	}

	email, err := user.ParseEmail(req.Email)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}
	if !h.allow(w, r, "auth:login:email:"+email.Normalize(), 5, 15*60) {
		return
	}

	u, err := h.userRepo.GetByEmail(ctx, email)
	if err != nil || u == nil {
		respondError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	match, err := h.hash.ComparePasswordAndHash(req.Password, u.Hash)
	if err != nil || !match {
		if h.limiter != nil {
			h.limiter.AllowWithBackoff(ctx, "auth:login:backoff:"+email.Normalize(), 5, []time.Duration{
				time.Second, 2 * time.Second, 4 * time.Second, 8 * time.Second, 16 * time.Second,
			})
		}
		respondError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	// Generate access token (15 minutes)
	accessToken, err := h.token.GenerateToken(u.ID.String(), 15*time.Minute)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	// Generate refresh token (7 days)
	refreshToken, err := newOpaqueToken(32)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate refresh token")
		return
	}

	sess := session.NewSession(u.ID, refreshToken, 7*24*time.Hour)
	if err := h.sessRepo.Create(ctx, sess); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	// Set refresh token as HttpOnly cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		HttpOnly: true,
		Secure:   r.TLS != nil,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		Expires:  sess.ExpiresAt,
	})

	respondJSON(w, http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int((15 * time.Minute).Seconds()),
		TokenType:    "Bearer",
		User: UserDTO{
			ID:           u.ID.String(),
			Email:        u.Email.String(),
			Name:         u.Name,
			IsVerified:   u.Verified,
			AuthProvider: "email",
		},
	})
}
