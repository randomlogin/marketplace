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


