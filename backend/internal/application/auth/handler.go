package auth

import (
	"encoding/json"
	"net/http"

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
