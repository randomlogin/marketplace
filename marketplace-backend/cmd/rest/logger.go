package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
	"github.com/spacesprotocol/explorer-indexer/pkg/node"
)

func withLogging(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Read body if present
		var bodyBytes []byte
		if r.Body != nil {
			var err error
			bodyBytes, r.Body, err = readBody(r.Body)
			if err != nil {
				log.Error().Err(err).Msg("Failed to read request body")
				http.Error(w, "Failed to read request body", http.StatusInternalServerError)
				return
			}
		}

		// Create response wrapper to capture status code
		rw := &responseWriter{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		// Build log details
		logEvent := log.Info().
			Str("path", r.URL.Path).
			Str("method", r.Method).
			Str("remote_addr", r.RemoteAddr)

		// Add body if present for non-GET requests
		if len(bodyBytes) > 0 && r.Method != http.MethodGet {
			var bodyJSON interface{}
			if err := json.Unmarshal(bodyBytes, &bodyJSON); err == nil {
				logEvent.Interface("body", bodyJSON)
			}
		}

		// Add query parameters for GET requests
		if r.Method == http.MethodGet && len(r.URL.RawQuery) > 0 {
			logEvent.Str("query", r.URL.RawQuery)
		}

		// Execute handler
		handler.ServeHTTP(rw, r)

		// Calculate duration and add final fields
		duration := time.Since(start)
		logEvent.
			Int("status", rw.statusCode).
			Dur("duration_ms", duration).
			Msg("Request handled")
	}
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(statusCode int) {
	rw.statusCode = statusCode
	rw.ResponseWriter.WriteHeader(statusCode)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	return rw.ResponseWriter.Write(b)
}

// Helper to read body and allow it to be read again
func readBody(r io.ReadCloser) ([]byte, io.ReadCloser, error) {
	body, err := io.ReadAll(r)
	if err != nil {
		return nil, r, err
	}
	return body, io.NopCloser(bytes.NewBuffer(body)), nil
}

// Extend the Action struct with a method to build a logged handler
func (a *Action) BuildLoggedHandler(tx *pgxpool.Pool, spacesClient node.SpacesClient) http.HandlerFunc {
	return withLogging(a.BuildHandler(tx, spacesClient))
}
