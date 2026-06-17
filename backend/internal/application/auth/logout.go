package auth

import (
	"net/http"
	"time"
)

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	cookie, err := r.Cookie("refresh_token")
	if err == nil && cookie.Value != "" {
		sess, err := h.sessRepo.GetByRefreshToken(ctx, cookie.Value)
		if err == nil && sess != nil {
			h.sessRepo.Revoke(ctx, sess.ID)
		}
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		HttpOnly: true,
		Secure:   true,
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	})

	respondJSON(w, http.StatusOK, map[string]string{"message": "logged out successfully"})
}
