package auth

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"qed-hub-backend/internal/application/port"
)

type AuthHandler struct {
	userRepo port.UserRepository
	sessRepo port.SessionRepository
	hash     port.Hash
	token    port.TokenService
	email    port.EmailSender
	cache    port.Cache
	limiter  port.RateLimiter
}

func NewAuthHandler(ur port.UserRepository, sr port.SessionRepository, h port.Hash, t port.TokenService, e port.EmailSender, c port.Cache, l port.RateLimiter) *AuthHandler {
	return &AuthHandler{
		userRepo: ur,
		sessRepo: sr,
		hash:     h,
		token:    t,
		email:    e,
		cache:    c,
		limiter:  l,
	}
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if data != nil {
		json.NewEncoder(w).Encode(data)
	}
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

func newOpaqueToken(bytes int) (string, error) {
	raw := make([]byte, bytes)
	if _, err := rand.Read(raw); err != nil {
		return "", err
	}
	return hex.EncodeToString(raw), nil
}

func (h *AuthHandler) allow(w http.ResponseWriter, r *http.Request, key string, limit int, windowSeconds int) bool {
	if h.limiter == nil {
		return true
	}
	ok, err := h.limiter.Allow(r.Context(), key, limit, time.Duration(windowSeconds)*time.Second)
	if err != nil || !ok {
		respondError(w, http.StatusTooManyRequests, "rate limit exceeded")
		return false
	}
	return true
}

func (h *AuthHandler) CSRFToken(w http.ResponseWriter, r *http.Request) {
	token, err := newOpaqueToken(32)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create csrf token")
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "csrf_token",
		Value:    token,
		HttpOnly: false,
		Secure:   r.TLS != nil,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
	})
	respondJSON(w, http.StatusOK, map[string]string{"csrf_token": token})
}
