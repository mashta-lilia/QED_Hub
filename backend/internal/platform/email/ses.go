package email

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/sesv2"
	"github.com/aws/aws-sdk-go-v2/service/sesv2/types"
)

type SESSender struct {
	client    *sesv2.Client
	fromEmail string
}

func NewSESSender(ctx context.Context, region, fromEmail string) (*SESSender, error) {
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS SDK config: %w", err)
	}

	return &SESSender{
		client:    sesv2.NewFromConfig(cfg),
		fromEmail: fromEmail,
	}, nil
}

func (s *SESSender) SendEmail(ctx context.Context, to, subject, body string) error {
	input := &sesv2.SendEmailInput{
		FromEmailAddress: aws.String(s.fromEmail),
		Destination: &types.Destination{
			ToAddresses: []string{to},
		},
		Content: &types.EmailContent{
			Simple: &types.Message{
				Subject: &types.Content{
					Data: aws.String(subject),
				},
				Body: &types.Body{
					Text: &types.Content{
						Data: aws.String(body),
					},
				},
			},
		},
	}

	_, err := s.client.SendEmail(ctx, input)
	if err != nil {
		return fmt.Errorf("failed to send email via SES: %w", err)
	}
	return nil
}
