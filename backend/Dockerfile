# syntax=docker/dockerfile:1

# ---- build stage ----
FROM golang:1.25-alpine AS build
WORKDIR /src

# Download dependencies first to leverage layer caching.
COPY go.mod go.sum ./
RUN go mod download

# Build the API server and the local-dev seed helper as static binaries.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api ./cmd/api \
 && CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/seed ./cmd/seed

# ---- runtime stage ----
FROM alpine:3.20
RUN apk add --no-cache ca-certificates \
 && adduser -D -u 10001 appuser
COPY --from=build /out/api /app/api
COPY --from=build /out/seed /app/seed
USER appuser
EXPOSE 4000
ENTRYPOINT ["/app/api"]
