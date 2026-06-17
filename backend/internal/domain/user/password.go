package user

import (
	"errors"
	"strings"
	"unicode"
	"unicode/utf8" // Додано для коректного підрахунку символів
)

// Оголошуємо нову чітку помилку для задовгого пароля
var (
	//ErrPasswordTooShort = errors.New("password is too short")
	ErrPasswordTooLong  = errors.New("password is too long")
	//ErrPasswordTooWeak  = errors.New("password is too weak")
)

// Password represents a plain text password adhering to domain rules.
type Password string

// ParsePassword validates a raw password string against complexity rules.
func ParsePassword(p string) (Password, error) {
	// ВИПРАВЛЕНО (Рядки 10-13): Використовуємо utf8.RuneCountInString замість len()
	// Тепер ми рахуємо реальні символи (runes), а не байтовий розмір рядка.
	runeCount := utf8.RuneCountInString(p)

	if runeCount < 8 {
		return "", ErrPasswordTooShort
	}
	
	// ВИПРАВЛЕНО: Для задовгого пароля тепер повертається окрема, логічна помилка
	if runeCount > 128 {
		return "", ErrPasswordTooLong
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