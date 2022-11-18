package mongodb

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Connect(connection Connection, ctx context.Context) *mongo.Client {
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(connection.Uri).SetConnectTimeout(connection.Timeout*time.Second))
	if err != nil {
		log.Fatal(err)
		return nil
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal(err)
		return nil
	}

	log.Println("Mongodb login successful")
	return client
}
