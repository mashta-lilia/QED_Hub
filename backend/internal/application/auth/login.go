package auth

import (
	"crypto/rand"
	"encoding/hex"
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

	u, err := h.userRepo.GetByEmail(ctx, email)
	if err != nil || u == nil {
		respondError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	match, err := h.hash.ComparePasswordAndHash(req.Password, u.Hash)
	if err != nil || !match {
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
	rtBytes := make([]byte, 32)
	rand.Read(rtBytes)
	refreshToken := hex.EncodeToString(rtBytes)

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
		Secure:   true, // Should be driven by config for local dev
		Path:     "/",
		Expires:  sess.ExpiresAt,
	})

	respondJSON(w, http.StatusOK, AuthResponse{
		AccessToken: accessToken,
		User: UserDTO{
			ID:    u.ID.String(),
			Email: u.Email.String(),
			Name:  u.Name,
		},
	})
}
