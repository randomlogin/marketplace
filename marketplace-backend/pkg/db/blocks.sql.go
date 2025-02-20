// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: blocks.sql

package db

import (
	"context"
)

const getBlocksMaxHeight = `-- name: GetBlocksMaxHeight :one
SELECT COALESCE(MAX(height), -1)::integer
FROM blocks
`

func (q *Queries) GetBlocksMaxHeight(ctx context.Context) (int32, error) {
	row := q.db.QueryRow(ctx, getBlocksMaxHeight)
	var column_1 int32
	err := row.Scan(&column_1)
	return column_1, err
}

const getLatestBlock = `-- name: GetLatestBlock :one
WITH latest_block AS (
    SELECT height, hash
    FROM blocks
    ORDER BY height DESC
    LIMIT 1
)
SELECT
    COALESCE((SELECT height FROM latest_block), -2)::integer as height,
    COALESCE((SELECT hash FROM latest_block), '\x')::bytea as hash
`

type GetLatestBlockRow struct {
	Height int32
	Hash   []byte
}

func (q *Queries) GetLatestBlock(ctx context.Context) (GetLatestBlockRow, error) {
	row := q.db.QueryRow(ctx, getLatestBlock)
	var i GetLatestBlockRow
	err := row.Scan(&i.Height, &i.Hash)
	return i, err
}

const insertBlock = `-- name: InsertBlock :exec
INSERT INTO blocks (
    hash,
    height
)
VALUES ($1, $2)
`

type InsertBlockParams struct {
	Hash   []byte
	Height int32
}

func (q *Queries) InsertBlock(ctx context.Context, arg InsertBlockParams) error {
	_, err := q.db.Exec(ctx, insertBlock, arg.Hash, arg.Height)
	return err
}

const upsertBlock = `-- name: UpsertBlock :exec
INSERT INTO blocks (hash, height)
VALUES ($1, $2)
ON CONFLICT (height)
DO UPDATE SET
        hash = EXCLUDED.hash
`

type UpsertBlockParams struct {
	Hash   []byte
	Height int32
}

func (q *Queries) UpsertBlock(ctx context.Context, arg UpsertBlockParams) error {
	_, err := q.db.Exec(ctx, upsertBlock, arg.Hash, arg.Height)
	return err
}
