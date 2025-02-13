-- name: UpsertListing :exec
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
        valid = EXCLUDED.valid;


-- name: InsertListing :exec
INSERT INTO listings (
    name,
    price,
    seller,
    signature,
    height
)
VALUES ($1, $2, $3, $4, $5);


-- name: GetLatestListings :many
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
SELECT *
FROM RankedListings
ORDER BY
  CASE WHEN sqlc.arg('sort_by')::text = 'price' AND sqlc.arg('sort_order')::text = 'asc' THEN price END ASC,
  CASE WHEN sqlc.arg('sort_by')::text = 'price' AND sqlc.arg('sort_order')::text = 'desc' THEN price END DESC,
  CASE WHEN sqlc.arg('sort_by')::text = 'timestamp' AND sqlc.arg('sort_order')::text = 'asc' THEN timestamp END ASC,
  CASE WHEN sqlc.arg('sort_by')::text = 'timestamp' AND sqlc.arg('sort_order')::text = 'desc' THEN timestamp END DESC
limit sqlc.arg('limit')
OFFSET sqlc.arg('offset');


-- name: GetListingByName :many
SELECT * 
FROM listings
WHERE name = $1 order by price asc;

-- name: GetValidListingByName :many
SELECT * 
FROM listings
WHERE name = $1 and valid = true;


-- name: UpdateListingValidityAndHeight :exec
UPDATE listings
SET valid = $2, height = $3
WHERE signature = $1;
