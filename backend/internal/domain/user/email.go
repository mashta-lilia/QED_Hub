package user

import (
	"regexp"
	"strings"
)

var emailRegex = regexp.MustCompile(`^[a-z0-9._\-]+@gmail\.com$`)

// Email represents a validated email address value object.
type Email string

// ParseEmail validates and normalizes an email string.
func ParseEmail(e string) (Email, error) {
	clean := strings.TrimSpace(strings.ToLower(e))
	if len(clean) > 254 || strings.Contains(clean, "+") {
		return "", ErrInvalidEmail
	}
	if !emailRegex.MatchString(clean) {
		return "", ErrInvalidEmail
	}
	return Email(clean), nil
}

// String returns the string representation.
func (e Email) String() string {
	return string(e)
}

func (e Email) Normalize() string {
	parts := strings.SplitN(string(e), "@", 2)
	if len(parts) != 2 {
		return string(e)
	}
	return strings.ReplaceAll(parts[0], ".", "") + "@" + parts[1]
}
