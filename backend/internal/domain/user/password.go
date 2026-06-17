package user

import "unicode"

// Password represents a plain text password adhering to domain rules.
type Password string

// ParsePassword validates a raw password string against complexity rules.
func ParsePassword(p string) (Password, error) {
	if len(p) < 8 {
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
		case unicode.IsPunct(c) || unicode.IsSymbol(c):
			hasSpecial = true
		}
	}

	if !hasUpper || !hasLower || !hasNumber || !hasSpecial {
		return "", ErrPasswordTooWeak
	}

	return Password(p), nil
}

func (p Password) String() string {
	return string(p)
}
