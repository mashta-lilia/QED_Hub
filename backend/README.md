# QED Hub Backend

Dependency-free Node.js backend for secure authentication.

## Run

```bash
npm install
npm run dev
```

The API runs on `http://localhost:4000` by default.

## Environment

Copy `.env.example` to `.env` and set strong token secrets before production use.

## Auth endpoints

- `POST /api/auth/register` with `{ "email": "...", "password": "...", "name": "..." }`
- `POST /api/auth/login` with `{ "email": "...", "password": "..." }`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me` with `Authorization: Bearer <accessToken>`

Refresh tokens are stored in an HttpOnly cookie and persisted as hashes. Access tokens are short-lived signed tokens.

## Test

```bash
npm test
```
