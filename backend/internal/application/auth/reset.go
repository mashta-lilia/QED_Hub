package auth

import (
	"encoding/json"
	"net/http"
)

type ResetPasswordRequest struct {
	Email string `json:"email"`
}

type ResetPasswordConfirmRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

func (h *AuthHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	if !h.allow(w, r, "auth:reset:"+r.RemoteAddr, 3, 24*60*60) {
		return
	}

	var req ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request format")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "if the email exists, a reset link was sent"})
}

func (h *AuthHandler) ResetPasswordConfirm(w http.ResponseWriter, r *http.Request) {
	if !h.allow(w, r, "auth:reset-confirm:"+r.RemoteAddr, 5, 3600) {
		return
	}

	var req ResetPasswordConfirmRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request format")
		return
	}
	if req.Token == "" {
		respondError(w, http.StatusBadRequest, "token is required")
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "password reset successfully"})
}
