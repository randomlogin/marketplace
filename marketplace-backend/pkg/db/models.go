// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0

package db

type Block struct {
	Hash   []byte
	Height int32
}

type Listing struct {
	Name      string
	Price     int64
	Seller    string
	Signature []byte
	Timestamp int64
	Height    int32
	Valid     bool
}
