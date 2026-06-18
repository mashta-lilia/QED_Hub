package auth

import (
	"context"
	"encoding/json"
	"errors"
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

	startTime := time.Now()

	genericResponse := RegisterResponse{
		Message:               "if the email can be registered, a verification code has been sent",
		VerificationSessionID: "",
	}

	existingUser, err := h.userRepo.GetByEmail(ctx, email)
	if err != nil && !errors.Is(err, user.ErrUserNotFound) {
		respondError(w, http.StatusInternalServerError, "failed to process registration")
		return
	}

	if existingUser != nil {
		// Run dummy hashing to ensure identical CPU execution time across branches.
		_, _ = h.hash.HashPassword("dummy_password_for_timing_mitigation")

		enforceConstantTimeWindow(startTime, 500*time.Millisecond)
		respondJSON(w, http.StatusAccepted, genericResponse)
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
	
	if h.email == nil {
		respondError(w, http.StatusInternalServerError, "email service configuration missing")
		return
	}

	// Decouple from request lifetime to ensure email delivery succeeds if client disconnects.
	go func(bgCtx context.Context, emailStr, tokenStr string) {
		_ = h.email.SendEmail(bgCtx, emailStr, "Verify your QED Hub account", "Your verification code is "+tokenStr)
	}(context.Background(), email.String(), verificationToken.String())

	// Enforce uniform delay window to neutralize remote timing attacks.
	enforceConstantTimeWindow(startTime, 500*time.Millisecond)

	respondJSON(w, http.StatusAccepted, genericResponse)
}

func enforceConstantTimeWindow(startTime time.Time, duration time.Duration) {
	elapsed := time.Since(startTime)
	if elapsed < duration {
		time.Sleep(duration - elapsed)
	}
}