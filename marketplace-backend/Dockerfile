FROM golang:1.21-alpine AS builder

WORKDIR /app

# RUN apk add --no-cache gcc musl-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /rest-server ./cmd/rest

# Final stage
FROM alpine:3.19
WORKDIR /app

# RUN apk add --no-cache ca-certificates

# Copy binary from builder
COPY --from=builder /rest-server .

COPY env.example .env

EXPOSE 8080

CMD ["./rest-server"]
