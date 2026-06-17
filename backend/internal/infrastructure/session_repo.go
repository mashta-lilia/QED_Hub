package infrastructure

import (
	"context"

	"github.com/google/uuid"
	"qed-hub-backend/internal/application/port"
	"qed-hub-backend/internal/domain/session"
	"qed-hub-backend/internal/platform/postgres"
)

type sessionRepo struct {
	pool postgres.Pool
}

func NewSessionRepository(pool postgres.Pool) port.SessionRepository {
	return &sessionRepo{pool: pool}
}

func (r *sessionRepo) Create(ctx context.Context, s *session.Session) error {
	query := `
		INSERT INTO sessions (id, user_id, refresh_token, is_revoked, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := r.pool.Exec(ctx, query, s.ID, s.UserID, s.RefreshToken, s.IsRevoked, s.ExpiresAt, s.CreatedAt)
	return err
}

func (r *sessionRepo) GetByID(ctx context.Context, id uuid.UUID) (*session.Session, error) {
	query := `SELECT id, user_id, refresh_token, is_revoked, expires_at, created_at FROM sessions WHERE id = $1`
	return r.scanSession(ctx, query, id)
}

func (r *sessionRepo) GetByRefreshToken(ctx context.Context, token string) (*session.Session, error) {
	query := `SELECT id, user_id, refresh_token, is_revoked, expires_at, created_at FROM sessions WHERE refresh_token = $1`
	return r.scanSession(ctx, query, token)
}

func (r *sessionRepo) Revoke(ctx context.Context, id uuid.UUID) error {
	query := `UPDATE sessions SET is_revoked = true WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, id)
	return err
}

func (r *sessionRepo) scanSession(ctx context.Context, query string, args ...interface{}) (*session.Session, error) {
	var s session.Session
	err := r.pool.QueryRow(ctx, query, args...).Scan(
		&s.ID, &s.UserID, &s.RefreshToken, &s.IsRevoked, &s.ExpiresAt, &s.CreatedAt,
	)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}
