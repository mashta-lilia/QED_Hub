package infrastructure

import (
	"context"

	"github.com/google/uuid"
	"qed-hub-backend/internal/application/port"
	"qed-hub-backend/internal/domain/user"
	"qed-hub-backend/internal/platform/postgres"
)

type userRepo struct {
	pool postgres.Pool
}

func NewUserRepository(pool postgres.Pool) port.UserRepository {
	return &userRepo{pool: pool}
}

func (r *userRepo) Create(ctx context.Context, u *user.User) error {
	query := `
		INSERT INTO users (id, email, name, password_hash, is_verified, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := r.pool.Exec(ctx, query, u.ID, u.Email.String(), u.Name, u.Hash, u.Verified, u.CreatedAt, u.UpdatedAt)
	return err
}

func (r *userRepo) GetByID(ctx context.Context, id uuid.UUID) (*user.User, error) {
	query := `SELECT id, email, name, password_hash, is_verified, created_at, updated_at FROM users WHERE id = $1`
	return r.scanUser(ctx, query, id)
}

func (r *userRepo) GetByEmail(ctx context.Context, email user.Email) (*user.User, error) {
	query := `SELECT id, email, name, password_hash, is_verified, created_at, updated_at FROM users WHERE email = $1`
	return r.scanUser(ctx, query, email.String())
}

func (r *userRepo) Update(ctx context.Context, u *user.User) error {
	query := `
		UPDATE users SET email=$2, name=$3, password_hash=$4, is_verified=$5, updated_at=$6
		WHERE id = $1`
	_, err := r.pool.Exec(ctx, query, u.ID, u.Email.String(), u.Name, u.Hash, u.Verified, u.UpdatedAt)
	return err
}

func (r *userRepo) scanUser(ctx context.Context, query string, args ...interface{}) (*user.User, error) {
	var u user.User
	var emailStr string
	err := r.pool.QueryRow(ctx, query, args...).Scan(
		&u.ID, &emailStr, &u.Name, &u.Hash, &u.Verified, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		// pgx.ErrNoRows would mean user not found
		if err.Error() == "no rows in result set" {
			return nil, nil // Return nil if not found
		}
		return nil, err
	}
	email, _ := user.ParseEmail(emailStr)
	u.Email = email
	return &u, nil
}
