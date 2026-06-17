package port

import (
	"context"
	"time"
)

// RateLimiter defines the interface for rate limiting.
type RateLimiter interface {
	Allow(ctx context.Context, key string, limit int, window time.Duration) (bool, error)
	AllowWithBackoff(ctx context.Context, key string, maxAttempts int, backoffs []time.Duration) (bool, int, error)
	Reset(ctx context.Context, key string) error
}
