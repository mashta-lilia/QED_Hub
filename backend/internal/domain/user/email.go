package user

import (
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,4}$`)

// Email represents a validated email address value object.
type Email string

// ParseEmail validates and normalizes an email string.
func ParseEmail(e string) (Email, error) {
	clean := strings.TrimSpace(strings.ToLower(e))
	if !emailRegex.MatchString(clean) {
		return "", ErrInvalidEmail
	}
	return Email(clean), nil
}

// String returns the string representation.
func (e Email) String() string {
	return string(e)
}
