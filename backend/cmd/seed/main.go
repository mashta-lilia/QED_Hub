package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgconn"

	"qed-hub-backend/internal/domain/user"
	"qed-hub-backend/internal/infrastructure"
	"qed-hub-backend/internal/platform/hash"
	"qed-hub-backend/internal/platform/postgres"
)

// Local-only helper to seed a verified test admin account directly, bypassing
// the email-verification + email-service requirement of the public register flow.
func main() {
	ctx := context.Background()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is required")
	}

	emailStr := os.Getenv("SEED_EMAIL")
	if emailStr == "" {
		emailStr = "admin@gmail.com"
	}
	password := os.Getenv("SEED_PASSWORD")
	if password == "" {
		password = "admin"
	}
	name := os.Getenv("SEED_NAME")
	if name == "" {
		name = "admin"
	}

	pool, err := postgres.NewPool(ctx, postgres.Config{URL: dbURL})
	if err != nil {
		log.Fatalf("postgres connect: %v", err)
	}
	defer pool.Close()

	repo := infrastructure.NewUserRepository(pool)
	hasher := hash.NewArgon2idHasher()

	email, err := user.ParseEmail(emailStr)
	if err != nil {
		log.Fatalf("parse email %q: %v", emailStr, err)
	}

	pwdHash, err := hasher.HashPassword(password)
	if err != nil {
		log.Fatalf("hash password: %v", err)
	}

	u, err := user.NewUser(email, name, pwdHash)
	if err != nil {
		log.Fatalf("new user: %v", err)
	}
	u.Verify()

	if err := repo.Create(ctx, u); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			fmt.Printf("admin already exists: email=%s\n", email.String())
			return
		}
		log.Fatalf("create user: %v", err)
	}

	fmt.Printf("seeded admin: id=%s email=%s name=%s verified=%v\n", u.ID, email.String(), name, u.Verified)
}
