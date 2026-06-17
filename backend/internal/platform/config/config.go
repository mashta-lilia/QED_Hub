package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

// Config holds the application configuration
type Config struct {
	Env              string
	Port             int
	DatabaseURL      string
	RedisURL         string
	JWTSymmetricKey  string
	JWTExpiration    time.Duration
	AWSRegion        string
	AWSSESFromEmail  string
	TurnstileSecret  string
}

// Load reads configuration from environment variables
func Load() (*Config, error) {
	port, err := parseInt(os.Getenv("PORT"), 4000)
	if err != nil {
		return nil, fmt.Errorf("invalid PORT: %w", err)
	}

	jwtExp, err := time.ParseDuration(getEnvOrDefault("JWT_EXPIRATION", "15m"))
	if err != nil {
		return nil, fmt.Errorf("invalid JWT_EXPIRATION: %w", err)
	}

	cfg := &Config{
		Env:             getEnvOrDefault("ENV", "development"),
		Port:            port,
		DatabaseURL:     os.Getenv("DATABASE_URL"),
		RedisURL:        getEnvOrDefault("REDIS_URL", "redis://localhost:6379/0"),
		JWTSymmetricKey: os.Getenv("JWT_SYMMETRIC_KEY"),
		JWTExpiration:   jwtExp,
		AWSRegion:       os.Getenv("AWS_REGION"),
		AWSSESFromEmail: os.Getenv("AWS_SES_FROM_EMAIL"),
		TurnstileSecret: os.Getenv("TURNSTILE_SECRET"),
	}

	return cfg, nil
}

func getEnvOrDefault(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}

func parseInt(s string, defaultVal int) (int, error) {
	if s == "" {
		return defaultVal, nil
	}
	return strconv.Atoi(s)
}
