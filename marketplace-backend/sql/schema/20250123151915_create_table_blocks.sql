-- +goose Up
-- +goose StatementBegin
create table blocks(
    hash bytea PRIMARY KEY CHECK (LENGTH(hash) = 32),
    "height" integer unique NOT NULL CHECK (HEIGHT >= -1)
)
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
drop table blocks;
-- +goose StatementEnd
