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

	// ВИПРАВЛЕНО: Повертаємо 501, оскільки генерація токенів та відправка листів ще не готові
	respondJSON(w, http.StatusNotImplemented, map[string]string{
		"error": "Password reset initiation is not yet implemented",
	})
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

	// ВИПРАВЛЕНО (Рядки 43-46): Замість фейкового успіху повертаємо 501.
	// Клієнт повинен знати, що зміна пароля в базі даних ще не працює.
	respondJSON(w, http.StatusNotImplemented, map[string]string{
		"error": "Password reset confirmation is not yet implemented",
	})
}