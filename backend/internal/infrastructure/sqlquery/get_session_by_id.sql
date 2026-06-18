SELECT id, user_id, refresh_token_hash, is_revoked, expires_at, created_at
FROM sessions
WHERE id = $1
