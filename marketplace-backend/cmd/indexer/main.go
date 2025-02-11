package main

import (
	"context"
	"encoding/hex"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/jackc/pgx"
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

	// sigBytes, err := hex.DecodeString("959270ee39b3fbdd8eab2caf0b5bbdbaac36a38a26e29d4d04f493ce4072be0974498deb264dc01cc87935b7f2d73a8945ff2c93050d5cdd3b58b9fe0aedba74")
	// if err != nil {
	// 	log.Fatal(err)
	// }
	//
	// listing := node.Listing{
	// 	Space:     "@broccoli",
	// 	Price:     1,
	// 	Seller:    "bcrts1pvmxzgwweh7hp9pdsc2vhx0ngs4jed0ap57mg36s9pat6ys8xzmlqz3p2rm",
	// 	Signature: sigBytes,
	// }
	//
	// err = sc.VerifyListing(context.Background(), listing)
	// if err != nil {
	// 	log.Printf("Verification failed: %v", err)
	// 	return
	// }
	//
	// log.Print("yo")
	connCtx, cancel := context.WithTimeout(context.Background(), time.Minute)

	pg, err := pgx.Connect(connCtx, os.Getenv("POSTGRES_URI"))
	cancel()

	if err != nil {
		log.Printf("failed to connect to database: %v", err)
		time.Sleep(time.Second)
	}

	defer pg.Close(context.Background())

	for {

		if err := syncBlocks(pg, &sc); err != nil {
			log.Println(err)
			pg.Close(context.Background())
			time.Sleep(time.Second)
			continue
		}
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

	height, hash, err := getSyncedHead(pg, sc)
	if err != nil {
		return err
	}

	//invalidate all listings
	var seenNames []string
	listings, err := q.GetListingsAfterBlock(ctx, int32(height))
	if err != nil {
		return err
	}

	height++
	for {
		if height > sinfo.Tip.Height {
			break
		}

		log.Printf("found synced block of height %d and hash %s", height, hash)
		//height to hash!!
		hashString := hex.EncodeToString(hash)
		spacesBlock, err := sc.GetBlockMeta(ctx, hashString)
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
				seenNames = append(seenNames, spent.ScriptError.Name)
			}

		}

		for _, name := range seenNames {
			listings, err := q.GetListingByName(ctx, name)
			if err != nil {
				return err
			}
			for _, listing := range listings {
				err = sc.VerifyListing(context.Background(), node.Listing{Space: listing.Name, Seller: listing.SellerAddress, Signature: listing.Signature, Price: int(listing.Price)})
				if err != nil {
					listingValidityUpdate := db.UpdateListingValidityParams{Signature: listing.Signature, Valid: false, UpdatedHeight: int32(height)}
					q.UpdateListingValidity(ctx, listingValidityUpdate)
				} else {
					listingValidityUpdate := db.UpdateListingValidityParams{Signature: listing.Signature, Valid: true, UpdatedHeight: int32(height)}
					q.UpdateListingValidity(ctx, listingValidityUpdate)
				}
			}
		}

		height++
	}
	return nil
}

func getSyncedHead(pg *pgx.Conn, sc *node.SpacesClient) (int, []byte, error)
