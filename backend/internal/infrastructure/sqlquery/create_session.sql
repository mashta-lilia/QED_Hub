INSERT INTO sessions (id, user_id, refresh_token_hash, is_revoked, expires_at, created_at)
VALUES ($1, $2, $3, $4, $5, $6)
