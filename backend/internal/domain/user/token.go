package user

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

// VerificationToken represents an email verification token
type VerificationToken struct {
	Token     string
	ExpiresAt time.Time
}

// NewVerificationToken generates a new secure random token
func NewVerificationToken(expiration time.Duration) (*VerificationToken, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return nil, err
	}

	return &VerificationToken{
		Token:     hex.EncodeToString(b),
		ExpiresAt: time.Now().Add(expiration),
	}, nil
}

// IsValid checks if the token is not expired
func (t *VerificationToken) IsValid() bool {
	return time.Now().Before(t.ExpiresAt)
}
