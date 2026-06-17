package auth

import (
	"encoding/json"
	"net/http"
	"time"

	"qed-hub-backend/internal/domain/user"
)

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Rate limiting check
	ip := r.RemoteAddr
	allowed, err := h.limiter.Allow(ctx, "register_ip:"+ip, 5, 15*time.Minute)
	if err != nil || !allowed {
		respondError(w, http.StatusTooManyRequests, "rate limit exceeded")
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request format")
		return
	}

	email, err := user.ParseEmail(req.Email)
	if err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	if _, err := user.ParsePassword(req.Password); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}

	existingUser, _ := h.userRepo.GetByEmail(ctx, email)
	if existingUser != nil {
		respondError(w, http.StatusConflict, user.ErrUserAlreadyExists.Error())
		return
	}

	hashedPwd, err := h.hash.HashPassword(req.Password)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to process password")
		return
	}

	newUser, err := user.NewUser(email, req.Name, hashedPwd)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create user")
		return
	}

	if err := h.userRepo.Create(ctx, newUser); err != nil {
		respondError(w, http.StatusInternalServerError, "failed to save user")
		return
	}

	// For simplicity, we just return created without email verification logic yet
	// In reality, we would send an email here with a verification token

	respondJSON(w, http.StatusCreated, map[string]string{"message": "user created successfully"})
}
