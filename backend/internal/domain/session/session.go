package session

import (
	"crypto/sha256"
	"encoding/hex"
	"time"

	"github.com/google/uuid"
)

// Session represents a user session.
type Session struct {
	ID               uuid.UUID
	UserID           uuid.UUID
	RefreshTokenHash string
	IsRevoked        bool
	ExpiresAt        time.Time
	CreatedAt        time.Time
}

// NewSession creates a new session.
func NewSession(userID uuid.UUID, refreshToken string, duration time.Duration) *Session {
	return &Session{
		ID:               uuid.New(),
		UserID:           userID,
		RefreshTokenHash: HashRefreshToken(refreshToken),
		IsRevoked:        false,
		ExpiresAt:        time.Now().Add(duration),
		CreatedAt:        time.Now(),
	}
}

func HashRefreshToken(refreshToken string) string {
	sum := sha256.Sum256([]byte(refreshToken))
	return hex.EncodeToString(sum[:])
}

// IsValid checks if the session is valid and not expired.
func (s *Session) IsValid() bool {
	return !s.IsRevoked && time.Now().Before(s.ExpiresAt)
}

// Revoke marks the session as revoked.
func (s *Session) Revoke() {
	s.IsRevoked = true
}
