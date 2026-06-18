package user

import "testing"

func TestParseEmailAcceptsGmailAndNormalizes(t *testing.T) {
	email, err := ParseEmail(" Student.Name@gmail.com ")
	if err != nil {
		t.Fatalf("ParseEmail returned error: %v", err)
	}
	if email.String() != "student.name@gmail.com" {
		t.Fatalf("email = %q", email.String())
	}
	if email.Normalize() != "studentname@gmail.com" {
		t.Fatalf("normalized email = %q", email.Normalize())
	}
}

func TestParseEmailRejectsUnsupportedEmail(t *testing.T) {
	tests := []string{
		"student@example.com",
		"student+alias@gmail.com",
		"not-an-email",
	}

	for _, test := range tests {
		if _, err := ParseEmail(test); err == nil {
			t.Fatalf("ParseEmail(%q) returned nil error", test)
		}
	}
}
