package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/spacesprotocol/explorer-indexer/pkg/node"
)

func main() {
	log.SetFlags(log.LstdFlags | log.Llongfile)

	poolConfig, err := pgxpool.ParseConfig(os.Getenv("POSTGRES_URI"))
	if err != nil {
		log.Fatalf("Unable to parse config: %v", err)
	}

	port := os.Getenv("REST_PORT")

	pg, err := pgxpool.NewWithConfig(context.Background(), poolConfig)
	if err != nil {
		log.Fatalf("Unable to create connection pool: %v", err)
	}
	defer pg.Close()

	client := node.NewClient(os.Getenv("SPACES_NODE_URI"), "test", "test")
	spacesClient := node.SpacesClient{Client: client}

	getListing := NewAction(http.MethodGet, getListingHandler)
	getListings := NewAction(http.MethodGet, getListingsHandler)
	postListing := NewAction(http.MethodPost, postListingHandler)
	healthCheck := NewAction(http.MethodGet, healthCheckHandler)

	mux := http.NewServeMux()
	mux.HandleFunc("/healthcheck", healthCheck.BuildLoggedHandler(pg, spacesClient))
	mux.HandleFunc("/space/", getListing.BuildLoggedHandler(pg, spacesClient))
	mux.HandleFunc("/listings", getListings.BuildLoggedHandler(pg, spacesClient))
	mux.HandleFunc("/postListing", postListing.BuildLoggedHandler(pg, spacesClient))

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: mux,
	}

	go func() {
		log.Printf("Starting server at %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalln("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}
