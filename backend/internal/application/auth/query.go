package auth

import (
	"net/http"
	"strings"

	"github.com/google/uuid"
)

func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		respondError(w, http.StatusUnauthorized, "missing authorization header")
		return
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	userIDStr, err := h.token.ValidateToken(tokenStr)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid access token")
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		respondError(w, http.StatusUnauthorized, "invalid user id in token")
		return
	}

	u, err := h.userRepo.GetByID(ctx, userID)
	if err != nil || u == nil {
		respondError(w, http.StatusUnauthorized, "user not found")
		return
	}

	respondJSON(w, http.StatusOK, UserDTO{
		ID:    u.ID.String(),
		Email: u.Email.String(),
		Name:  u.Name,
	})
}
