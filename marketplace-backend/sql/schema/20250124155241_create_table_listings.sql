-- +goose Up
-- +goose StatementBegin
create table listings(
      name varchar(63) not null,
      price bigint not null check (price <= 2100000000000000 and price >= 0),  
      seller varchar(150) not null,
      signature BYTEA PRIMARY KEY,
      timestamp BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
      height integer not null, -- references blocks(height),
      valid BOOLEAN not null default true
);


CREATE INDEX listings_index_seller ON listings(seller);
CREATE INDEX listings_index_name ON listings(name);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP index listings_index_seller_address;
DROP index listings_index_name;
DROP table listings;
-- +goose StatementEnd
