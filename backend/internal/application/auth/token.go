package auth

import (
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

	// 1. Обчислюємо хеш токена, щоб унікалізувати ключ лімітера
	refreshHash := session.HashRefreshToken(cookie.Value)

	// Використовуємо ізольований ключ на основі хешу токена для захисту від платформного DoS
	if !h.allow(w, r, "auth:refresh:"+refreshHash, 10, 60) {
		return
	}

	// 2. Запит до репозиторію сесій
	sess, err := h.sessRepo.GetByRefreshTokenHash(ctx, refreshHash)
	if err != nil || sess == nil {
		respondError(w, http.StatusUnauthorized, "invalid or expired refresh token")
		return
	}
	if sess.IsRevoked {
		_ = h.sessRepo.RevokeAllForUser(ctx, sess.UserID)
		respondError(w, http.StatusUnauthorized, "refresh token reuse detected")
		return
	}
	if !sess.IsValid() {
		_ = h.sessRepo.RevokeAllForUser(ctx, sess.UserID)
		respondError(w, http.StatusUnauthorized, "invalid or expired refresh token")
		return
	}

	u, err := h.userRepo.GetByID(ctx, sess.UserID)
	if err != nil || u == nil {
		respondError(w, http.StatusUnauthorized, "user not found")
		return
	}

	// Ротація сесії (анулювання старої)
	h.sessRepo.Revoke(ctx, sess.ID)

	// Генерація нового Access Token
	accessToken, err := h.token.GenerateToken(u.ID.String(), 15*time.Minute)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate token")
		return
	}

	// Генерація нового Refresh Token
	newRefreshToken, err := newOpaqueToken(32)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to generate refresh token")
		return
	}

	newSess := session.NewSession(u.ID, newRefreshToken, 7*24*time.Hour)
	if err := h.sessRepo.Create(ctx, newSess); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create session")
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    newRefreshToken,
		HttpOnly: true,
		Secure:   r.TLS != nil,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		Expires:  newSess.ExpiresAt,
	})

	respondJSON(w, http.StatusOK, AuthResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
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