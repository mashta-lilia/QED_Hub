# QED Hub Backend

Go authentication service following the Issue #4 package-oriented design.

## Run

```bash
go mod download
go run ./cmd/api
```

The API runs on `http://localhost:4000` by default.

## Environment

Copy `.env.example` to `.env` and set real PostgreSQL, Redis, JWT, SES, and Turnstile values before production use.

## Auth endpoints

- `GET /api/auth/csrf-token`
- `POST /api/auth/register` with `{ "email": "...", "password": "...", "name": "..." }`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/auth/login` with `{ "email": "...", "password": "..." }`
- `POST /api/auth/google`
- `POST /api/auth/reset-password`
- `POST /api/auth/reset-password/confirm`
- `POST /api/auth/refresh-token`
- `POST /api/auth/logout`
- `GET /api/auth/me` with `Authorization: Bearer <accessToken>`

Mutating endpoints are protected by a double-submit CSRF token. Fetch `/api/auth/csrf-token`, then send the returned token in `X-CSRF-Token`.

Refresh tokens are stored in an HttpOnly cookie and persisted as SHA-256 hashes. Passwords are hashed with Argon2id and access tokens are short-lived JWTs.

## Test

```bash
go test ./...
```
