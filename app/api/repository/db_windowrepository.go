package repository

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"renkbench.de/api/model"
)

type dbWindowRepository struct {
	client *mongo.Client
}

func CreateDbWindowRepository(client *mongo.Client) *dbWindowRepository {
	return &dbWindowRepository{client}
}

func (windowRepository *dbWindowRepository) GetWindows(ctx context.Context) *model.Windows {
	windows := windowRepository.readData(bson.D{}, ctx)
	return windows
}

func (windowRepository *dbWindowRepository) GetWindowsByParentId(id int, ctx context.Context) *model.Windows {
	windows := windowRepository.readData(bson.D{{Key: "pid", Value: id}}, ctx)
	return windows
}

func (windowRepository *dbWindowRepository) readData(filter bson.D, ctx context.Context) *model.Windows {
	var windows model.Windows

	collection := windowRepository.client.Database("renkbench").Collection("windows")
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		log.Fatal(err)
		return &windows
	}
	defer cursor.Close(ctx)

	err = cursor.All(ctx, &windows.Windows)
	if err != nil {
		log.Fatal(err)
		return &windows
	}

	log.Printf("Loaded windows: %v", &windows)
	return &windows
}
