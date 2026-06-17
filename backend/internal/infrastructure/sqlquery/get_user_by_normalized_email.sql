SELECT id, email, name, password_hash, is_verified, created_at, updated_at
FROM users
WHERE normalized_email = $1
