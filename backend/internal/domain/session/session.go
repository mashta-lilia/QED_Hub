package session

import (
	"time"

	"github.com/google/uuid"
)

// Session represents a user session.
type Session struct {
	ID           uuid.UUID
	UserID       uuid.UUID
	RefreshToken string
	IsRevoked    bool
	ExpiresAt    time.Time
	CreatedAt    time.Time
}

// NewSession creates a new session.
func NewSession(userID uuid.UUID, refreshToken string, duration time.Duration) *Session {
	return &Session{
		ID:           uuid.New(),
		UserID:       userID,
		RefreshToken: refreshToken,
		IsRevoked:    false,
		ExpiresAt:    time.Now().Add(duration),
		CreatedAt:    time.Now(),
	}
}

// IsValid checks if the session is valid and not expired.
func (s *Session) IsValid() bool {
	return !s.IsRevoked && time.Now().Before(s.ExpiresAt)
}

// Revoke marks the session as revoked.
func (s *Session) Revoke() {
	s.IsRevoked = true
}
