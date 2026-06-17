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
	AccessToken string `json:"access_token"`
	User        UserDTO `json:"user"`
}

// UserDTO representation of user
type UserDTO struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}
