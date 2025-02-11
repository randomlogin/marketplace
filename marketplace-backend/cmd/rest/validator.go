package main

import (
	"context"

	"github.com/go-playground/validator/v10"
	"github.com/spacesprotocol/explorer-indexer/pkg/node"
	"github.com/spacesprotocol/marketplace/pkg/db"
)

type Context struct {
	context.Context
	DB        *db.Queries
	Spaces    node.SpacesClient
	Validator *validator.Validate
}

// NewContext creates a new context with initialized validator
func NewContext(ctx context.Context, queries *db.Queries, spaces node.SpacesClient) *Context {
	return &Context{
		Context:   ctx,
		DB:        queries,
		Spaces:    spaces,
		Validator: validator.New(),
	}
}

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

// getValidationErrorMsg returns a user-friendly error message for validation errors
func getValidationErrorMsg(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "This field is required"
	case "oneof":
		return "Must be one of: " + err.Param()
	case "min":
		return "Must be greater than or equal to " + err.Param()
	case "max":
		return "Must be less than or equal to " + err.Param()
	default:
		return "Invalid value"
	}
}
