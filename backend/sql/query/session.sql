-- name: CreateSession :one
INSERT INTO sessions (id, user_id, refresh_token_hash, access_token_id, expires_at, user_agent, ip_address, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: GetSessionByRefreshTokenHash :one
SELECT * FROM sessions WHERE refresh_token_hash = $1 LIMIT 1;

-- name: RevokeSession :exec
UPDATE sessions SET is_revoked = TRUE WHERE id = $1;

-- name: RevokeAllSessionsForUser :exec
UPDATE sessions SET is_revoked = TRUE WHERE user_id = $1;
