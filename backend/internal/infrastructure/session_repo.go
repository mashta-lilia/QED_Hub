package infrastructure

import (
	"context"

	"github.com/google/uuid"
	"qed-hub-backend/internal/application/port"
	"qed-hub-backend/internal/domain/session"
	"qed-hub-backend/internal/infrastructure/sqlquery"
	"qed-hub-backend/internal/platform/postgres"
)

type sessionRepo struct {
	pool postgres.Pool
}

func NewSessionRepository(pool postgres.Pool) port.SessionRepository {
	return &sessionRepo{pool: pool}
}

func (r *sessionRepo) Create(ctx context.Context, s *session.Session) error {
	_, err := r.pool.Exec(ctx, sqlquery.CreateSession, s.ID, s.UserID, s.RefreshTokenHash, s.IsRevoked, s.ExpiresAt, s.CreatedAt)
	return err
}

func (r *sessionRepo) GetByID(ctx context.Context, id uuid.UUID) (*session.Session, error) {
	return r.scanSession(ctx, sqlquery.GetSessionByID, id)
}

func (r *sessionRepo) GetByRefreshTokenHash(ctx context.Context, tokenHash string) (*session.Session, error) {
	return r.scanSession(ctx, sqlquery.GetSessionByRefreshTokenHash, tokenHash)
}

func (r *sessionRepo) Revoke(ctx context.Context, id uuid.UUID) error {
	_, err := r.pool.Exec(ctx, sqlquery.RevokeSession, id)
	return err
}

func (r *sessionRepo) RevokeAllForUser(ctx context.Context, userID uuid.UUID) error {
	_, err := r.pool.Exec(ctx, sqlquery.RevokeUserSessions, userID)
	return err
}

func (r *sessionRepo) scanSession(ctx context.Context, query string, args ...interface{}) (*session.Session, error) {
	var s session.Session
	err := r.pool.QueryRow(ctx, query, args...).Scan(
		&s.ID, &s.UserID, &s.RefreshTokenHash, &s.IsRevoked, &s.ExpiresAt, &s.CreatedAt,
	)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}
