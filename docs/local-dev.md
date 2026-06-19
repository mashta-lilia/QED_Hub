# Local development

Run the whole stack (Postgres, Redis, migrations, Go API, React frontend) with Docker.

## Prerequisites

- Docker + Docker Compose v2

## Run everything

```bash
docker compose up -d --build
```

This starts, in order:

1. `postgres` and `redis` (with healthchecks)
2. `migrate` — applies `backend/sql/migration` once, then exits
3. `backend` — the Go API on http://localhost:4000
4. `frontend` — nginx serving the built SPA on http://localhost:8080,
   proxying `/api/*` to the backend (same origin, so cookies + CSRF work)

Open the app at http://localhost:8080.

## Seed a test admin

```bash
docker compose --profile seed run --rm seed
```

Creates a verified account (defaults, override via `.env`):

| Field    | Value             |
| -------- | ----------------- |
| email    | `admin@gmail.com` |
| password | `admin`           |

> The email validator only accepts `@gmail.com` addresses, and the public
> register flow enforces a strong-password policy + email verification, so the
> seeder writes the user directly (it reuses the app's Argon2id hasher).

## Smoke test the API

```bash
jar=$(mktemp)
csrf=$(curl -s -c "$jar" http://localhost:4000/api/auth/csrf-token \
  | sed -n 's/.*"csrf_token":"\([^"]*\)".*/\1/p')
curl -s -b "$jar" -H 'Content-Type: application/json' -H "X-CSRF-Token: $csrf" \
  -d '{"email":"admin@gmail.com","password":"admin"}' \
  http://localhost:4000/api/auth/login
```

Expect HTTP 200 with an `access_token`.

## Configuration

Defaults live in `docker-compose.yml`. To override, `cp .env.example .env` and edit.
The backend reads configuration from environment variables (see `backend/.env.example`).

## Tear down

```bash
docker compose down       # keep data
docker compose down -v    # also drop the Postgres volume
```

## CI

`.github/workflows/ci.yml` runs on every push to `main` and every PR:

- **backend** — `go build` / `go vet` / `go test`
- **frontend** — `npm ci` / `npm run build`
- **integration** — boots the compose stack, seeds the admin, and asserts a real
  login returns a JWT
