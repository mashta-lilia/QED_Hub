package user

import (
	"strings"
	"unicode"
)

// Password represents a plain text password adhering to domain rules.
type Password string

// ParsePassword validates a raw password string against complexity rules.
func ParsePassword(p string) (Password, error) {
	if len(p) < 8 || len(p) > 128 {
		return "", ErrPasswordTooShort
	}

	var hasUpper, hasLower, hasNumber, hasSpecial bool
	for _, c := range p {
		switch {
		case unicode.IsNumber(c):
			hasNumber = true
		case unicode.IsUpper(c):
			hasUpper = true
		case unicode.IsLower(c):
			hasLower = true
		case strings.ContainsRune("!@#$%^&*", c):
			hasSpecial = true
		}
	}

	if !hasUpper || !hasLower || !hasNumber || !hasSpecial {
		return "", ErrPasswordTooWeak
	}
	if hasRepeatedRunes(p, 4) || hasSequentialRunes(p, 4) {
		return "", ErrPasswordTooWeak
	}

	return Password(p), nil
}

func (p Password) String() string {
	return string(p)
}

func hasRepeatedRunes(value string, max int) bool {
	var previous rune
	count := 0
	for _, current := range strings.ToLower(value) {
		if current == previous {
			count++
		} else {
			previous = current
			count = 1
		}
		if count >= max {
			return true
		}
	}
	return false
}

func hasSequentialRunes(value string, max int) bool {
	runes := []rune(strings.ToLower(value))
	count := 1
	for i := 1; i < len(runes); i++ {
		if runes[i] == runes[i-1]+1 {
			count++
		} else {
			count = 1
		}
		if count >= max {
			return true
		}
	}
	return false
}
