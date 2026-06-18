UPDATE sessions
SET is_revoked = true
WHERE id = $1
