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

	// Замінено фейковий успіх на статус 501
	respondJSON(w, http.StatusNotImplemented, map[string]string{
		"error": "Email verification is not yet implemented",
	})
}

func (h *AuthHandler) ResendVerification(w http.ResponseWriter, r *http.Request) {
	if !h.allow(w, r, "auth:resend:"+r.RemoteAddr, 3, 3600) {
		return
	}
	
	// Замінено статус 202 на 501
	respondJSON(w, http.StatusNotImplemented, map[string]string{
		"error": "Resending verification email is not yet implemented",
	})
}