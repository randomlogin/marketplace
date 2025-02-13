package main

import (
	"encoding/hex"
	"fmt"
	"log"

	"github.com/spacesprotocol/explorer-indexer/pkg/node"
	"github.com/spacesprotocol/marketplace/pkg/db"
)

// Parameter and result types
type GetListingParams struct {
	Name string `json:"name"`
}

type GetListingsParams struct {
	Sort_by    string `json:"sort_by" validate:"omitempty,oneof=price timestamp"`
	Sort_order string `json:"sort_order" validate:"omitempty,oneof=asc desc"`
	Limit      int    `json:"limit" validate:"omitempty,min=1,max=100"`
	Offset     int    `json:"offset" validate:"omitempty,min=0"`
}

type ResponseListing struct {
	Space     string `json:"space"`
	Price     int    `json:"price"`
	Seller    string `json:"seller"`
	Signature string `json:"signature"`
	Timestamp int64  `json:"timestamp"`
	Height    int32  `json:"height"`
}

func getListingHandler(ctx *Context, params GetListingParams) (*ResponseListing, error) {
	if params.Name == "" {
		return nil, fmt.Errorf("name is required")
	}

	name := params.Name
	if len(name) > 0 && name[0] == '@' {
		name = name[1:]
	}

	listings, err := ctx.DB.GetValidListingByName(ctx, name)
	if err != nil {
		log.Printf("failed to get listing: %s", err)
		return nil, fmt.Errorf("failed to get listing")
	}

	if len(listings) == 0 {
		return nil, fmt.Errorf("no listing found")
	}

	return &ResponseListing{
		Space:     listings[0].Name,
		Price:     int(listings[0].Price),
		Seller:    listings[0].Seller,
		Signature: hex.EncodeToString(listings[0].Signature),
		Timestamp: listings[0].Timestamp,
		Height:    listings[0].Height,
	}, nil
}

func getListingsHandler(ctx *Context, params GetListingsParams) ([]ResponseListing, error) {
	if params.Sort_by == "" {
		params.Sort_by = "timestamp" // default sort field
	}
	if params.Sort_order == "" {
		params.Sort_order = "desc" // default sort order
	}
	if params.Limit <= 0 {
		params.Limit = 9 // default limit
	}

	if err := ctx.Validator.Struct(params); err != nil {
		return nil, fmt.Errorf("invalid parameters: %w", err)
	}

	dbParams := db.GetLatestListingsParams{
		SortBy:    params.Sort_by,
		SortOrder: params.Sort_order,
		Limit:     int32(params.Limit),
		Offset:    int32(params.Offset),
	}

	dbListings, err := ctx.DB.GetLatestListings(ctx, dbParams)
	if err != nil {
		log.Printf("failed to get listings: %s", err)
		return nil, fmt.Errorf("failed to get listings")
	}
	if len(dbListings) == 0 {
		return nil, fmt.Errorf("no listings found")
	}

	listings := make([]ResponseListing, 0, len(dbListings))
	for _, l := range dbListings {
		listings = append(listings, ResponseListing{
			Space:     l.Name,
			Price:     int(l.Price),
			Seller:    l.Seller,
			Signature: hex.EncodeToString(l.Signature),
			Timestamp: l.Timestamp,
			Height:    l.Height,
		})
	}
	return listings, nil
}

type HealthCheckResult = struct {
	Height       int32  `json:"height"`
	Hash         string `json:"hash"`
	SpacedHash   string `json:"spaced_hash"`
	SpacedHeight int    `json:"spaced_height"`
}

func healthCheckHandler(ctx *Context, _ struct{}) (*HealthCheckResult, error) {
	res, err := ctx.DB.GetLatestBlock(ctx)
	if err != nil {
		log.Printf("failed to perform a healthcheck: %s", err)
		return nil, fmt.Errorf("failed to perform a healthcheck")
	}
	serverInfo, err := ctx.Spaces.GetServerInfo(ctx)
	if err != nil {
		log.Printf("failed to perform a healthcheck: %s", err)
		return nil, fmt.Errorf("failed to perform a healthcheck")
	}
	toReturn := &HealthCheckResult{
		Height:       res.Height,
		Hash:         hex.EncodeToString(res.Hash),
		SpacedHash:   hex.EncodeToString(serverInfo.Tip.Hash),
		SpacedHeight: serverInfo.Tip.Height,
	}
	return toReturn, nil
}

func postListingHandler(ctx *Context, listing node.Listing) (*node.Listing, error) {
	if listing.Space == "" || listing.Price < 0 || listing.Seller == "" || listing.Signature == "" {
		return nil, fmt.Errorf("missing required fields")
	}

	listing.NormalizeSpace()
	if err := ctx.Spaces.VerifyListing(ctx, listing); err != nil {
		if len(err.Error()) <= 12 {
			return nil, err
		}
		if err.Error()[:12] == "rpc client: " {
			return nil, fmt.Errorf(err.Error()[12:])
		}
		log.Printf("got an error while trying to verify: %s", err)
		return nil, fmt.Errorf("An error occured")
	}

	signatureBytes, err := hex.DecodeString(listing.Signature)
	if err != nil {
		return nil, fmt.Errorf("invalid signature format: %s", err)
	}

	spaceName := listing.Space
	if len(spaceName) > 0 && spaceName[0] == '@' {
		spaceName = spaceName[1:]
	}

	err = ctx.DB.UpsertListing(ctx, db.UpsertListingParams{
		Name:      spaceName,
		Price:     int64(listing.Price),
		Seller:    listing.Seller,
		Signature: signatureBytes,
		Valid:     true,
	})
	if err != nil {
		log.Printf("failed to create listing: %s", err)
		return nil, fmt.Errorf("failed to create listing")
	}

	return &listing, nil
}
