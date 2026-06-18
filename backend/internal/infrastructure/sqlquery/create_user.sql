INSERT INTO users (id, email, normalized_email, name, password_hash, is_verified, auth_provider, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, 'email', $7, $8)
