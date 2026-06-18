// Package sqlquery handles raw SQL embeds.
// NOTE: Migration to full sqlc type-safe code generation is intentionally deferred 
// to a later development phase. Using temporary go:embed approach.
package sqlquery

import _ "embed"

//go:embed create_user.sql
var CreateUser string

//go:embed get_user_by_id.sql
var GetUserByID string

//go:embed get_user_by_normalized_email.sql
var GetUserByNormalizedEmail string

//go:embed update_user.sql
var UpdateUser string

//go:embed create_session.sql
var CreateSession string

//go:embed get_session_by_id.sql
var GetSessionByID string

//go:embed get_session_by_refresh_token_hash.sql
var GetSessionByRefreshTokenHash string

//go:embed revoke_session.sql
var RevokeSession string

//go:embed revoke_user_sessions.sql
var RevokeUserSessions string