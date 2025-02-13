package main

import (
	"context"
	"encoding/hex"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/spacesprotocol/explorer-indexer/pkg/node"
	"github.com/spacesprotocol/marketplace/pkg/db"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	spacesClient := node.NewClient(os.Getenv("SPACES_NODE_URI"), "test", "test")
	updateInterval, err := strconv.Atoi(os.Getenv("UPDATE_DB_INTERVAL"))
	if err != nil {
		log.Fatalln(err)
	}
	sc := node.SpacesClient{Client: spacesClient}

	for {
		connCtx, cancel := context.WithTimeout(context.Background(), time.Minute)
		pg, err := pgx.Connect(connCtx, os.Getenv("POSTGRES_URI"))
		cancel()
		if err != nil {
			log.Printf("failed to connect to database: %v", err)
			time.Sleep(time.Second)
			continue
		}

		if err := syncBlocks(pg, &sc); err != nil {
			log.Println(err)
			pg.Close(context.Background())
			time.Sleep(time.Second)
			continue
		}

		pg.Close(context.Background())
		time.Sleep(time.Duration(updateInterval) * time.Second)
	}
}

func syncBlocks(pg *pgx.Conn, sc *node.SpacesClient) error {
	q := db.New(pg)
	ctx := context.Background()
	sinfo, err := sc.GetServerInfo(ctx)
	if err != nil {
		return err
	}

	height, _, err := getSyncedHead(pg, sc)
	if err != nil {
		return err
	}

	log.Printf("found the height %d in the db", height)

	//invalidate all listings
	var seenNames []string

	// var spacesBlock *node.SpacesBlock
	height++
	for {
		if height > sinfo.Tip.Height {
			break
		}

		log.Printf("trying to get the block %d from the chain", height)
		spacesBlock, err := sc.GetBlockMeta(ctx, height)
		if err != nil {
			break
		}
		for _, tx := range spacesBlock.Transactions {
			for _, created := range tx.Creates {
				seenNames = append(seenNames, created.Name)
			}
			for _, updated := range tx.Updates {
				seenNames = append(seenNames, updated.Output.Name)
			}
			for _, spent := range tx.Spends {
				if spent.ScriptError != nil {
					seenNames = append(seenNames, spent.ScriptError.Name)
				}
			}

		}

		// log.Print(len(seenNames))
		// log.Print(seenNames)
		for _, name := range seenNames {
			var spaceName string
			if len(name) > 0 && name[0] == '@' {
				spaceName = name[1:]
			}

			listings, err := q.GetListingByName(ctx, spaceName)
			if err != nil {
				return err
			}
			// log.Print(len(listings))
			for _, listing := range listings {
				sign := hex.EncodeToString(listing.Signature)
				err = sc.VerifyListing(context.Background(), node.Listing{Space: listing.Name, Seller: listing.Seller, Signature: sign, Price: int(listing.Price)})
				if err != nil {
					listingValidityUpdate := db.UpdateListingValidityParams{Signature: listing.Signature, Valid: false}
					q.UpdateListingValidity(ctx, listingValidityUpdate)
				} else {
					listingValidityUpdate := db.UpdateListingValidityParams{Signature: listing.Signature, Valid: true}
					q.UpdateListingValidity(ctx, listingValidityUpdate)
				}
			}
		}

		err = q.UpsertBlock(ctx, db.UpsertBlockParams{Height: int32(height) - 1, Hash: spacesBlock.Hash})
		if err != nil {
			return err
		}
		height++
	}
	return nil
}

func getSyncedHead(pg *pgx.Conn, sc *node.SpacesClient) (int, []byte, error) {
	q := db.New(pg)
	maxBlock, err := q.GetBlocksMaxHeight(context.Background())
	if err != nil {
		return 0, nil, err
	}
	return int(maxBlock), nil, nil
}
