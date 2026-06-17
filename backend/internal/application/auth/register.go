package auth

import (
	"encoding/json"
	"net"
	"net/http"
	"time"

	"qed-hub-backend/internal/domain/user"
)

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	ip, _, _ := net.SplitHostPort(r.RemoteAddr)
	if ip == "" {
		ip = r.RemoteAddr
	}
	if !h.allow(w, r, "auth:register:ip:"+ip, 3, 3600) {
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
		respondJSON(w, http.StatusAccepted, RegisterResponse{
			Message: "if the email can be registered, a verification code has been sent",
		})
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

	verificationToken, err := user.NewVerificationToken(10 * time.Minute)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "failed to create verification token")
		return
	}
	if h.email != nil {
		go h.email.SendEmail(ctx, email.String(), "Verify your QED Hub account", "Your verification code is "+verificationToken.String())
	}

	respondJSON(w, http.StatusCreated, RegisterResponse{
		Message:               "if the email can be registered, a verification code has been sent",
		VerificationSessionID: newUser.ID.String(),
	})
}
