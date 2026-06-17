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
    r.Use(chimiddleware.RequestID)
    r.Use(chimiddleware.RealIP)
    r.Use(chimiddleware.Logger)
    r.Use(chimiddleware.Recoverer)
    r.Use(chimiddleware.Timeout(60 * time.Second))
    r.Use(transportmiddleware.SecurityHeaders)
    r.Use(transportmiddleware.CORS(cfg.ClientOrigin))

    // --- Liveness & Readiness Probes ---
    
    // Liveness Probe: Simply confirms the HTTP server is accepting requests.
    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK"))
    })

    // Readiness Probe: Confirms the application is ready to handle traffic by pinging dependencies.
    r.Get("/ready", func(w http.ResponseWriter, r *http.Request) {
        pingCtx, pingCancel := context.WithTimeout(r.Context(), 2*time.Second)
        defer pingCancel()

        // Ping Postgres
        if err := dbPool.Ping(pingCtx); err != nil {
            log.Printf("Readiness check failed - Postgres: %v", err)
            http.Error(w, "Database unavailable", http.StatusServiceUnavailable)
            return
        }

        // Ping Redis (assuming standard go-redis client syntax)
        if err := redisClient.Ping(pingCtx).Err(); err != nil {
            log.Printf("Readiness check failed - Redis: %v", err)
            http.Error(w, "Redis unavailable", http.StatusServiceUnavailable)
            return
        }

        w.WriteHeader(http.StatusOK)
        w.Write([]byte("Ready"))
    })

    // --- Application Routes ---

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