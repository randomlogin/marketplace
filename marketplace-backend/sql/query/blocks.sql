-- name: InsertBlock :exec
INSERT INTO blocks (
    hash,
    height
)
VALUES ($1, $2);

-- name: UpsertBlock :exec
INSERT INTO blocks (hash, height)
VALUES ($1, $2)
ON CONFLICT (height)
DO UPDATE SET
        hash = EXCLUDED.hash;


-- name: GetBlocksMaxHeight :one
SELECT COALESCE(MAX(height), -1)::integer
FROM blocks;


-- name: GetLatestBlock :one
WITH latest_block AS (
    SELECT height, hash
    FROM blocks
    ORDER BY height DESC
    LIMIT 1
)
SELECT
    COALESCE((SELECT height FROM latest_block), -2)::integer as height,
    COALESCE((SELECT hash FROM latest_block), '\x')::bytea as hash;
