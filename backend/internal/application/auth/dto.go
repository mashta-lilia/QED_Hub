package auth

// RegisterRequest DTO for registration
type RegisterRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

// LoginRequest DTO for login
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse DTO for authentication responses
type AuthResponse struct {
	AccessToken  string  `json:"access_token"`
	RefreshToken string  `json:"refresh_token,omitempty"`
	ExpiresIn    int     `json:"expires_in"`
	TokenType    string  `json:"token_type"`
	User         UserDTO `json:"user"`
}

type RegisterResponse struct {
	Message               string `json:"message"`
	VerificationSessionID string `json:"verification_session_id,omitempty"`
}

type VerifyEmailResponse struct {
	Success           bool `json:"success"`
	RemainingAttempts int  `json:"remaining_attempts"`
	CooldownSeconds   int  `json:"cooldown_seconds"`
}

// UserDTO representation of user
type UserDTO struct {
	ID           string `json:"id"`
	Email        string `json:"email"`
	Name         string `json:"name"`
	IsVerified   bool   `json:"is_verified"`
	AuthProvider string `json:"auth_provider"`
}
