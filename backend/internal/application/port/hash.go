package port

// Hash defines the password hashing interface.
type Hash interface {
	HashPassword(password string) (string, error)
	ComparePasswordAndHash(password, encodedHash string) (bool, error)
}
