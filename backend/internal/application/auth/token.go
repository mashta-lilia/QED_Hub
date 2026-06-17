package auth

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"qed-hub-backend/internal/domain/session"
)

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	cookie, err := r.Cookie("refresh_token")
	if err != nil {
		respondError(w, http.StatusUnauthorized, "missing refresh token")
		return
	}

	sess, err := h.sessRepo.GetByRefreshToken(ctx, cookie.Value)
	if err != nil || sess == nil || !sess.IsValid() {
		respondError(w, http.StatusUnauthorized, "invalid or expired refresh token")
		return
	}

	u, err := h.userRepo.GetByID(ctx, sess.UserID)
	if err != nil || u == nil {
		respondError(w, http.StatusUnauthorized, "user not found")
		return
	}

	// Revoke old session (rotation)
	h.sessRepo.Revoke(ctx, sess.ID)

	// Generate new access token
	accessToken, err := h.token.GenerateToken(u.ID.String(), 15*time.Minute)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	// Generate new refresh token
	rtBytes := make([]byte, 32)
	rand.Read(rtBytes)
	newRefreshToken := hex.EncodeToString(rtBytes)

	newSess := session.NewSession(u.ID, newRefreshToken, 7*24*time.Hour)
	if err := h.sessRepo.Create(ctx, newSess); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    newRefreshToken,
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
		Expires:  newSess.ExpiresAt,
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
