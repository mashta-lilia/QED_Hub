package user

import "errors"

var (
	ErrInvalidEmail      = errors.New("invalid email address")
	ErrPasswordTooShort  = errors.New("password must be at least 8 characters")
	ErrPasswordTooWeak   = errors.New("password must contain uppercase, lowercase, number, and special character")
	ErrUserNotFound      = errors.New("user not found")
	ErrUserAlreadyExists = errors.New("user already exists")
	ErrEmailNotVerified  = errors.New("email not verified")
	ErrInvalidToken      = errors.New("invalid or expired token")
)
