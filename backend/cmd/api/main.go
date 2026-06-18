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
	chimiddleware "github.com/go-chi/chi/v5/middleware"

	"qed-hub-backend/internal/application/auth"
	"qed-hub-backend/internal/infrastructure"
	"qed-hub-backend/internal/platform/config"
	"qed-hub-backend/internal/platform/hash"
	"qed-hub-backend/internal/platform/jwt"
	"qed-hub-backend/internal/platform/postgres"
	"qed-hub-backend/internal/platform/redis"
	transportmiddleware "qed-hub-backend/internal/transport/middleware"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("startup error: %v", err)
	}
}

func run() error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("config load: %w", err)
	}

	dbPool, err := postgres.NewPool(ctx, postgres.Config{URL: cfg.DatabaseURL})
	if err != nil {
		return fmt.Errorf("postgres connect: %w", err)
	}
	defer dbPool.Close()

	redisClient, err := redis.NewClient(ctx, redis.Config{URL: cfg.RedisURL})
	if err != nil {
		return fmt.Errorf("redis connect: %w", err)
	}
	defer redisClient.Close()

	rateLimiter := redis.NewRateLimiter(redisClient)
	argonHasher := hash.NewArgon2idHasher()
	tokenService := jwt.NewTokenService(cfg.JWTSymmetricKey, "qed-hub-auth")

	emailSender := &localEmailSender{
		region:    cfg.AWSRegion,
		fromEmail: cfg.AWSSESFromEmail,
	}

	tokenCache := &localTokenCache{
		client: redisClient,
	}

	userRepo := infrastructure.NewUserRepository(dbPool)
	sessRepo := infrastructure.NewSessionRepository(dbPool)

	authHandler := auth.NewAuthHandler(
		userRepo,
		sessRepo,
		argonHasher,
		tokenService,
		emailSender,
		tokenCache,
		rateLimiter,
	)

	r := chi.NewRouter()
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(60 * time.Second))
	r.Use(transportmiddleware.SecurityHeaders)
	r.Use(transportmiddleware.CORS(cfg.ClientOrigin))
	
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	r.Get("/ready", func(w http.ResponseWriter, r *http.Request) {
		pingCtx, pingCancel := context.WithTimeout(r.Context(), 2*time.Second)
		defer pingCancel()

		if err := dbPool.Ping(pingCtx); err != nil {
			log.Printf("Readiness check failed - Postgres: %v", err)
			http.Error(w, "Database unavailable", http.StatusServiceUnavailable)
			return
		}

		if err := redisClient.Ping(pingCtx).Err(); err != nil {
			log.Printf("Readiness check failed - Redis: %v", err)
			http.Error(w, "Redis unavailable", http.StatusServiceUnavailable)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Ready"))
	})

	r.Route("/api/auth", func(r chi.Router) {
		r.Get("/csrf-token", authHandler.CSRFToken)
		r.Group(func(r chi.Router) {
			r.Use(transportmiddleware.CSRF)
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
			r.Post("/refresh-token", authHandler.Refresh)
			r.Post("/logout", authHandler.Logout)
			r.Post("/verify-email", authHandler.VerifyEmail)
			r.Post("/resend-verification", authHandler.ResendVerification)
			r.Post("/google", authHandler.GoogleOAuth)
			r.Post("/reset-password", authHandler.ResetPassword)
			r.Post("/reset-password/confirm", authHandler.ResetPasswordConfirm)
		})
		r.Get("/me", authHandler.Me)
	})

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

type localEmailSender struct {
	region    string
	fromEmail string
}

func (m *localEmailSender) SendEmail(ctx context.Context, to, subject, body string) error {
	log.Printf("[AWS SES] Sending email to %s via region %s", to, m.region)
	return nil
}

type localTokenCache struct {
	client interface{}
}

func (m *localTokenCache) Set(ctx context.Context, key string, val interface{}, ttl time.Duration) error {
	return nil
}

func (m *localTokenCache) Get(ctx context.Context, key string) (string, error) {
	return "", nil
}

func (m *localTokenCache) Delete(ctx context.Context, key string) error {
	return nil
}