package user

import (
	"time"

	"github.com/google/uuid"
)

// User represents the user aggregate root.
type User struct {
	ID        uuid.UUID
	Email     Email
	Name      string
	Hash      string
	Verified  bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

// NewUser creates a new User aggregate.
func NewUser(email Email, name, hash string) (*User, error) {
	return &User{
		ID:        uuid.New(),
		Email:     email,
		Name:      name,
		Hash:      hash,
		Verified:  false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}, nil
}

// Verify marks the user as verified.
func (u *User) Verify() {
	u.Verified = true
	u.UpdatedAt = time.Now()
}
