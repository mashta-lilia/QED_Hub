package user

import "testing"

func TestParsePasswordRequiresComplexPassword(t *testing.T) {
	if _, err := ParsePassword("Str0ng!Pass"); err != nil {
		t.Fatalf("ParsePassword returned error: %v", err)
	}
}

func TestParsePasswordRejectsWeakPassword(t *testing.T) {
	tests := []string{
		"short1!",
		"lowercase1!",
		"UPPERCASE1!",
		"NoNumber!",
		"NoSpecial1",
		"Abcd!234",
		"Aaaa!234",
	}

	for _, test := range tests {
		if _, err := ParsePassword(test); err == nil {
			t.Fatalf("ParsePassword(%q) returned nil error", test)
		}
	}
}
