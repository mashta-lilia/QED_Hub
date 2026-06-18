package port

import "context"

// EmailSender defines the interface for sending emails.
type EmailSender interface {
	SendEmail(ctx context.Context, to, subject, body string) error
}
