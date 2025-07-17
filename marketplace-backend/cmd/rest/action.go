package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"strconv"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/spacesprotocol/explorer-indexer/pkg/node"
	"github.com/spacesprotocol/marketplace/pkg/db"
)

type Action struct {
	Method   string
	Params   reflect.Type
	Result   reflect.Type
	Function reflect.Value
}

// NewAction creates a new Action from a function with the signature:
// func(ctx *Context, params T) (result R, err error)
func NewAction(method string, function interface{}) *Action {
	t := reflect.TypeOf(function)
	if t.NumIn() != 2 || t.NumOut() != 2 {
		panic("handler must have signature: func(ctx *Context, params T) (result R, err error)")
	}
	if t.In(0) != reflect.TypeOf(&Context{}) {
		panic("first parameter must be *Context")
	}
	if !t.Out(1).Implements(reflect.TypeOf((*error)(nil)).Elem()) {
		panic("second return value must be error")
	}

	return &Action{
		Method:   method,
		Params:   t.In(1),
		Result:   t.Out(0),
		Function: reflect.ValueOf(function),
	}
}

// writeResult writes the result as JSON response
func (a *Action) writeResult(w http.ResponseWriter, result interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(result); err != nil {
		log.Printf("failed to encode response: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

// parseBody parses and validates JSON request body into a new instance of the params type
func (a *Action) parseBody(r *http.Request, ctx *Context) (reflect.Value, error) {
	params := reflect.New(a.Params)
	if err := json.NewDecoder(r.Body).Decode(params.Interface()); err != nil {
		return reflect.Value{}, fmt.Errorf("failed to decode request body: %w", err)
	}

	// Validate if the struct implements validation tags
	if ctx.Validator != nil {
		if err := ctx.Validator.Struct(params.Interface()); err != nil {
			if validationErrs, ok := err.(validator.ValidationErrors); ok {
				// Just return the validation error directly
				return reflect.Value{}, validationErrs
			}
			return reflect.Value{}, err
		}
	}

	return params.Elem(), nil
}

// BuildHandler creates an http.HandlerFunc for this action with validation
func (a *Action) BuildHandler(tx *pgxpool.Pool, spacesClient node.SpacesClient) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != a.Method {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}

		dbTx, err := tx.Begin(r.Context())
		if err != nil {
			log.Printf("failed to begin transaction: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		defer dbTx.Rollback(r.Context())

		queries := db.New(dbTx)
		ctx := NewContext(r.Context(), queries, spacesClient)

		var params reflect.Value
		if a.Method == http.MethodPost || a.Method == http.MethodPut {
			params, err = a.parseBody(r, ctx)
			if err != nil {
				if validationErrs, ok := err.(validator.ValidationErrors); ok {
					w.WriteHeader(http.StatusBadRequest)
					// Return the validation errors directly
					json.NewEncoder(w).Encode(validationErrs)
					return
				}
				log.Printf("failed to parse body: %v", err)
				w.WriteHeader(http.StatusBadRequest)
				return
			}
		} else {
			params = reflect.New(a.Params).Elem()
			// For GET requests, handle query parameters
			if err := r.ParseForm(); err == nil {
				for key, values := range r.Form {
					if len(values) > 0 {
						field := params.FieldByName(strings.Title(key))
						if field.IsValid() {
							switch field.Kind() {
							case reflect.String:
								field.SetString(values[0])
							case reflect.Int:
								if val, err := strconv.Atoi(values[0]); err == nil {
									field.SetInt(int64(val))
								}
							}
						}
					}
				}
			}
			// Handle path parameters
			if strings.HasPrefix(r.URL.Path, "/space/") {
				name := strings.TrimPrefix(r.URL.Path, "/space/")
				if field := params.FieldByName("Name"); field.IsValid() {
					field.SetString(name)
				}
			}

			// Validate query parameters
			if ctx.Validator != nil {
				if err := ctx.Validator.Struct(params.Interface()); err != nil {
					if validationErrs, ok := err.(validator.ValidationErrors); ok {
						w.WriteHeader(http.StatusBadRequest)
						json.NewEncoder(w).Encode(validationErrs)
						return
					}
					w.WriteHeader(http.StatusBadRequest)
					json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
					return
				}
			}
		}

		out := a.Function.Call([]reflect.Value{
			reflect.ValueOf(ctx),
			params,
		})

		if !out[1].IsNil() {
			err := out[1].Interface().(error)

			errMsg := err.Error()
			if strings.Contains(errMsg, "no listing found") || strings.Contains(errMsg, "not found") {
				w.WriteHeader(http.StatusNotFound)
				json.NewEncoder(w).Encode(map[string]string{"error": errMsg})
				return
			}

			log.Printf("handler error: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
			return
		}

		if err := dbTx.Commit(r.Context()); err != nil {
			log.Printf("failed to commit transaction: %v", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		a.writeResult(w, out[0].Interface())
	}
}
