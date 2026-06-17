UPDATE sessions
SET is_revoked = true
WHERE user_id = $1
