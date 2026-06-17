CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    normalized_email VARCHAR(254) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    auth_provider VARCHAR(20) NOT NULL DEFAULT 'email',
    google_id VARCHAR(255) UNIQUE,
    verification_token_hash VARCHAR(64),
    verification_token_expires_at TIMESTAMP WITH TIME ZONE,
    verification_attempts INTEGER NOT NULL DEFAULT 0,
    reset_token_hash VARCHAR(64),
    reset_token_expires_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
