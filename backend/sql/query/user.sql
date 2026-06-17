-- name: CreateUser :one
INSERT INTO users (id, email, normalized_email, name, password_hash, is_verified, auth_provider, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, 'email', $7, $8)
RETURNING *;

-- name: GetUserByNormalizedEmail :one
SELECT * FROM users WHERE normalized_email = $1 LIMIT 1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1 LIMIT 1;

-- name: UpdateUserVerification :one
UPDATE users SET is_verified = TRUE, verification_token_hash = NULL, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ResetFailedLogins :exec
UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1;
