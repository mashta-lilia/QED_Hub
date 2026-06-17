package auth

import (
	"net/http"
)

func (h *AuthHandler) GoogleOAuth(w http.ResponseWriter, r *http.Request) {
	if !h.allow(w, r, "auth:google:"+r.RemoteAddr, 10, 60) {
		return
	}

	respondJSON(w, http.StatusAccepted, map[string]string{"message": "google oauth request accepted"})
}
