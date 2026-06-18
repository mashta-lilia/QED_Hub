package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Pool is a type alias for *pgxpool.Pool to decouple consumers from the pgxpool package if needed
type Pool = *pgxpool.Pool

// Config holds the configuration for connecting to the database
type Config struct {
	URL string
}

// NewPool creates a new PostgreSQL connection pool
func NewPool(ctx context.Context, cfg Config) (Pool, error) {
	if cfg.URL == "" {
		return nil, fmt.Errorf("database URL is required")
	}

	poolConfig, err := pgxpool.ParseConfig(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database config: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return pool, nil
}
