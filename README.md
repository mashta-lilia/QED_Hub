# QED_Hub
The platform is a centralized, high-performance learning environment designed to bridge the gap between theoretical university lectures and practical problem-solving. 

## Project structure

- `frontend/` - React + TypeScript + Tailwind learning interface.
- `backend/` - Go authentication API with package-oriented design, Argon2id password hashing, JWT sessions, PostgreSQL migrations, Redis rate limiting, and security middleware.

## Run locally

With Docker Compose (Postgres, Redis, migrations, API, and the web app):

```bash
docker compose up -d --build                  # start the full stack
docker compose --profile seed run --rm seed   # seed admin@gmail.com / admin
```

- Web app: http://localhost:8080
- API: http://localhost:4000

See [docs/local-dev.md](docs/local-dev.md) for configuration and teardown.
