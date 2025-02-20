// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: listings.sql

package db

import (
	"context"
)

const getLatestListings = `-- name: GetLatestListings :many
WITH RankedListings AS (
  SELECT DISTINCT ON (name)
    name,
    price,
    seller,
    signature,
    timestamp,
    height
  FROM listings
  WHERE valid = true
  ORDER BY name, price ASC
)
SELECT name, price, seller, signature, timestamp, height
FROM RankedListings
ORDER BY
  CASE WHEN $1::text = 'price' AND $2::text = 'asc' THEN price END ASC,
  CASE WHEN $1::text = 'price' AND $2::text = 'desc' THEN price END DESC,
  CASE WHEN $1::text = 'timestamp' AND $2::text = 'asc' THEN timestamp END ASC,
  CASE WHEN $1::text = 'timestamp' AND $2::text = 'desc' THEN timestamp END DESC
limit $4
OFFSET $3
`

type GetLatestListingsParams struct {
	SortBy    string
	SortOrder string
	Offset    int32
	Limit     int32
}

type GetLatestListingsRow struct {
	Name      string
	Price     int64
	Seller    string
	Signature []byte
	Timestamp int64
	Height    int32
}

func (q *Queries) GetLatestListings(ctx context.Context, arg GetLatestListingsParams) ([]GetLatestListingsRow, error) {
	rows, err := q.db.Query(ctx, getLatestListings,
		arg.SortBy,
		arg.SortOrder,
		arg.Offset,
		arg.Limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []GetLatestListingsRow{}
	for rows.Next() {
		var i GetLatestListingsRow
		if err := rows.Scan(
			&i.Name,
			&i.Price,
			&i.Seller,
			&i.Signature,
			&i.Timestamp,
			&i.Height,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getListingByName = `-- name: GetListingByName :many
SELECT name, price, seller, signature, timestamp, height, valid 
FROM listings
WHERE name = $1 order by price asc
`

func (q *Queries) GetListingByName(ctx context.Context, name string) ([]Listing, error) {
	rows, err := q.db.Query(ctx, getListingByName, name)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Listing{}
	for rows.Next() {
		var i Listing
		if err := rows.Scan(
			&i.Name,
			&i.Price,
			&i.Seller,
			&i.Signature,
			&i.Timestamp,
			&i.Height,
			&i.Valid,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getValidListingByName = `-- name: GetValidListingByName :many
SELECT name, price, seller, signature, timestamp, height, valid 
FROM listings
WHERE name = $1 and valid = true order by price asc limit 1
`

func (q *Queries) GetValidListingByName(ctx context.Context, name string) ([]Listing, error) {
	rows, err := q.db.Query(ctx, getValidListingByName, name)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Listing{}
	for rows.Next() {
		var i Listing
		if err := rows.Scan(
			&i.Name,
			&i.Price,
			&i.Seller,
			&i.Signature,
			&i.Timestamp,
			&i.Height,
			&i.Valid,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const insertListing = `-- name: InsertListing :exec
INSERT INTO listings (
    name,
    price,
    seller,
    signature,
    height
)
VALUES ($1, $2, $3, $4, $5)
`

type InsertListingParams struct {
	Name      string
	Price     int64
	Seller    string
	Signature []byte
	Height    int32
}

func (q *Queries) InsertListing(ctx context.Context, arg InsertListingParams) error {
	_, err := q.db.Exec(ctx, insertListing,
		arg.Name,
		arg.Price,
		arg.Seller,
		arg.Signature,
		arg.Height,
	)
	return err
}

const updateListingValidityAndHeight = `-- name: UpdateListingValidityAndHeight :exec
UPDATE listings
SET valid = $2, height = $3
WHERE signature = $1
`

type UpdateListingValidityAndHeightParams struct {
	Signature []byte
	Valid     bool
	Height    int32
}

func (q *Queries) UpdateListingValidityAndHeight(ctx context.Context, arg UpdateListingValidityAndHeightParams) error {
	_, err := q.db.Exec(ctx, updateListingValidityAndHeight, arg.Signature, arg.Valid, arg.Height)
	return err
}

const upsertListing = `-- name: UpsertListing :exec
INSERT INTO listings (
    name,
    price,
    seller,
    signature,
    height,
    valid
)
VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (signature)
DO UPDATE SET
        name = EXCLUDED.name,
        price = EXCLUDED.price,
        seller = EXCLUDED.seller,
        height = EXCLUDED.height,
        valid = EXCLUDED.valid
`

type UpsertListingParams struct {
	Name      string
	Price     int64
	Seller    string
	Signature []byte
	Height    int32
	Valid     bool
}

func (q *Queries) UpsertListing(ctx context.Context, arg UpsertListingParams) error {
	_, err := q.db.Exec(ctx, upsertListing,
		arg.Name,
		arg.Price,
		arg.Seller,
		arg.Signature,
		arg.Height,
		arg.Valid,
	)
	return err
}
