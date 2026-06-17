package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"qed-hub-backend/internal/application/auth"
	"qed-hub-backend/internal/infrastructure"
	"qed-hub-backend/internal/platform/config"
	"qed-hub-backend/internal/platform/hash"
	"qed-hub-backend/internal/platform/jwt"
	"qed-hub-backend/internal/platform/postgres"
	"qed-hub-backend/internal/platform/redis"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("startup error: %v", err)
	}
}

func run() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Load Configuration
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("config load: %w", err)
	}

	// 1. Setup Postgres
	dbPool, err := postgres.NewPool(ctx, postgres.Config{URL: cfg.DatabaseURL})
	if err != nil {
		return fmt.Errorf("postgres connect: %w", err)
	}
	defer dbPool.Close()

	// 2. Setup Redis
	redisClient, err := redis.NewClient(ctx, redis.Config{URL: cfg.RedisURL})
	if err != nil {
		return fmt.Errorf("redis connect: %w", err)
	}
	defer redisClient.Close()

	// 3. Setup Platform Services
	rateLimiter := redis.NewRateLimiter(redisClient)
	argonHasher := hash.NewArgon2idHasher()
	tokenService := jwt.NewTokenService(cfg.JWTSymmetricKey, "qed-hub-auth")
	
	// Note: AWS SES and cache initialization omitted for brevity if credentials are not present
	// They would be initialized here and passed to the auth handler.
	
	// 4. Setup Infrastructure (Repositories)
	userRepo := infrastructure.NewUserRepository(dbPool)
	sessRepo := infrastructure.NewSessionRepository(dbPool)

	// 5. Setup Application (Use Cases/Handlers)
	authHandler := auth.NewAuthHandler(userRepo, sessRepo, argonHasher, tokenService, nil, nil, rateLimiter)

	// 6. Setup Router
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
		r.Post("/refresh", authHandler.Refresh)
		r.Post("/logout", authHandler.Logout)
		r.Get("/me", authHandler.Me)
		r.Post("/verify", authHandler.VerifyEmail)
		r.Get("/google", authHandler.GoogleOAuth)
		r.Post("/reset", authHandler.ResetPassword)
		r.Post("/reset/confirm", authHandler.ResetPasswordConfirm)
	})

	// 7. Start Server
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	serverErrors := make(chan error, 1)
	go func() {
		log.Printf("Server starting on %s", srv.Addr)
		serverErrors <- srv.ListenAndServe()
	}()

	// 8. Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)

	select {
	case err := <-serverErrors:
		return fmt.Errorf("server error: %w", err)

	case sig := <-quit:
		log.Printf("Shutdown started, signal: %v", sig)
		defer log.Println("Shutdown complete")

		ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
		defer cancel()

		if err := srv.Shutdown(ctx); err != nil {
			srv.Close()
			return fmt.Errorf("graceful shutdown failed: %w", err)
		}
	}

	return nil
}
