package port

import (
	"context"

	"github.com/google/uuid"
	"qed-hub-backend/internal/domain/session"
	"qed-hub-backend/internal/domain/user"
)

// UserRepository defines the interface for user persistence.
type UserRepository interface {
	Create(ctx context.Context, u *user.User) error
	GetByID(ctx context.Context, id uuid.UUID) (*user.User, error)
	GetByEmail(ctx context.Context, email user.Email) (*user.User, error)
	Update(ctx context.Context, u *user.User) error
}

// SessionRepository defines the interface for session persistence.
type SessionRepository interface {
	Create(ctx context.Context, s *session.Session) error
	GetByID(ctx context.Context, id uuid.UUID) (*session.Session, error)
	GetByRefreshToken(ctx context.Context, token string) (*session.Session, error)
	Revoke(ctx context.Context, id uuid.UUID) error
}
