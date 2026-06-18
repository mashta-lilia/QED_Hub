package hash

import "testing"

func TestArgon2idHasher(t *testing.T) {
	hasher := NewArgon2idHasher()
	encoded, err := hasher.HashPassword("Str0ng!Pass")
	if err != nil {
		t.Fatalf("HashPassword returned error: %v", err)
	}

	ok, err := hasher.ComparePasswordAndHash("Str0ng!Pass", encoded)
	if err != nil {
		t.Fatalf("ComparePasswordAndHash returned error: %v", err)
	}
	if !ok {
		t.Fatal("expected password to match hash")
	}

	ok, err = hasher.ComparePasswordAndHash("Wrong!Pass1", encoded)
	if err != nil {
		t.Fatalf("ComparePasswordAndHash returned error: %v", err)
	}
	if ok {
		t.Fatal("unexpected password match")
	}
}
