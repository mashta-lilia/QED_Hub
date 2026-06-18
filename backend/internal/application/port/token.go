package port

import "time"

// TokenService defines the interface for token operations.
type TokenService interface {
	GenerateToken(userID string, duration time.Duration) (string, error)
	ValidateToken(tokenStr string) (string, error)
}
