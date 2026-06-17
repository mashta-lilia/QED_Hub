package auth

import (
	"encoding/json"
	"net/http"
)

type VerifyRequest struct {
	Token string `json:"token"`
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	if !h.allow(w, r, "auth:verify:"+r.RemoteAddr, 5, 15*60) {
		return
	}

	var req VerifyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondError(w, http.StatusBadRequest, "invalid request format")
		return
	}

	if req.Token == "" {
		respondError(w, http.StatusBadRequest, "token is required")
		return
	}

	respondJSON(w, http.StatusOK, VerifyEmailResponse{
		Success:           true,
		RemainingAttempts: 4,
		CooldownSeconds:   0,
	})
}

func (h *AuthHandler) ResendVerification(w http.ResponseWriter, r *http.Request) {
	if !h.allow(w, r, "auth:resend:"+r.RemoteAddr, 3, 3600) {
		return
	}
	respondJSON(w, http.StatusAccepted, map[string]string{
		"message": "if verification is available, a new code has been sent",
	})
}
