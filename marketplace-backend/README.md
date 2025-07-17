# Overview

This repository contains db schema and docker file and indexer mechanism to invalidate the listings of spaces on the
secondary market of spaces protocol.

- db
- rest
- indexer

# Run

db: docker-compose up
rest: `go run cmd/rest/*'
sync: `go run cmd/indexer/*'


# Environment

Look at env.example to see available environment variables.
