package redis

import (
	"context"
	"fmt"
	"time"

	goredis "github.com/redis/go-redis/v9"
)

// RateLimiter provides a generic sliding window rate limiting
type RateLimiter struct {
	client *Client
}

// NewRateLimiter creates a new rate limiter
func NewRateLimiter(client *Client) *RateLimiter {
	return &RateLimiter{client: client}
}

// Allow checks if the given key is allowed to proceed based on the limit and window.
func (r *RateLimiter) Allow(ctx context.Context, key string, limit int, window time.Duration) (bool, error) {
	pipe := r.client.Pipeline()
	now := time.Now()
	min := now.Add(-window)

	// Remove older entries
	pipe.ZRemRangeByScore(ctx, key, "-inf", fmt.Sprintf("%d", min.UnixNano()))

	// Add current timestamp
	pipe.ZAdd(ctx, key, goredis.Z{
		Score:  float64(now.UnixNano()),
		Member: now.UnixNano(),
	})

	// Count elements
	countCmd := pipe.ZCard(ctx, key)

	// Set expiration
	pipe.Expire(ctx, key, window)

	if _, err := pipe.Exec(ctx); err != nil {
		return false, fmt.Errorf("failed to execute rate limit pipeline: %w", err)
	}

	return countCmd.Val() <= int64(limit), nil
}

// AllowWithBackoff provides progressive delays
func (r *RateLimiter) AllowWithBackoff(ctx context.Context, key string, maxAttempts int, backoffs []time.Duration) (bool, int, error) {
	// Simple implementation for progressive delays
	attemptsCmd := r.client.Incr(ctx, key)
	r.client.Expire(ctx, key, backoffs[len(backoffs)-1])

	attempts := int(attemptsCmd.Val())
	if attempts > maxAttempts {
		return false, attempts, nil
	}
	return true, attempts, nil
}

func (r *RateLimiter) Reset(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}
