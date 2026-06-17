package session

import (
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestNewSessionStoresRefreshTokenHash(t *testing.T) {
	rawToken := "refresh-token"
	s := NewSession(uuid.New(), rawToken, time.Hour)

	if s.RefreshTokenHash == "" {
		t.Fatal("refresh token hash is empty")
	}
	if s.RefreshTokenHash == rawToken {
		t.Fatal("raw refresh token was stored")
	}
	if !s.IsValid() {
		t.Fatal("new session should be valid")
	}
}
