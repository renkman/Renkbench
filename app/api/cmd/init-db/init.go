package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"renkbench.de/api/data"
	"renkbench.de/api/mongodb"
)

func main() {
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, time.Second*11)
	defer cancel()

	uri := buildDatabaseUri()
	mongoClient := mongodb.Connect(mongodb.Connection{Uri: uri, Timeout: 10}, ctx)
	seed.Seed(mongoClient, ctx)
}

func getDatabaseCredentials() (string, string, string) {
	host := os.Getenv("DB_HOST")
	username := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	return host, username, password
}

func buildDatabaseUri() string {

	host, username, password := getDatabaseCredentials()
	uri := fmt.Sprintf("mongodb://%v:%v@%v", username, password, host)
	return uri
}
