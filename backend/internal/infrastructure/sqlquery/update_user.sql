UPDATE users
SET email = $2, normalized_email = $3, name = $4, password_hash = $5, is_verified = $6, updated_at = $7
WHERE id = $1
