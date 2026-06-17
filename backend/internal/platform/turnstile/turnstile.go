package turnstile

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const verifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

type Verifier struct {
	secret string
	client *http.Client
}

func NewVerifier(secret string) *Verifier {
	return &Verifier{
		secret: secret,
		client: &http.Client{Timeout: 5 * time.Second},
	}
}

type verifyResponse struct {
	Success    bool     `json:"success"`
	ErrorCodes []string `json:"error-codes"`
}

func (v *Verifier) Verify(ctx context.Context, token, remoteIP string) (bool, error) {
	if token == "" {
		return false, fmt.Errorf("empty token provided")
	}

	data := url.Values{}
	data.Set("secret", v.secret)
	data.Set("response", token)
	if remoteIP != "" {
		data.Set("remoteip", remoteIP)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, verifyURL, strings.NewReader(data.Encode()))
	if err != nil {
		return false, fmt.Errorf("failed to create turnstile request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := v.client.Do(req)
	if err != nil {
		return false, fmt.Errorf("failed to verify turnstile token: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, fmt.Errorf("failed to read turnstile response: %w", err)
	}

	var res verifyResponse
	if err := json.Unmarshal(body, &res); err != nil {
		return false, fmt.Errorf("failed to decode turnstile response: %w", err)
	}

	if !res.Success {
		return false, fmt.Errorf("turnstile verification failed: %v", res.ErrorCodes)
	}

	return true, nil
}
