package repository

import (
	"context"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"

	"renkbench.de/api/model"
)

type dbMenuRepository struct {
	client *mongo.Client
}

func CreateDbMenuRepository(client *mongo.Client) *dbMenuRepository {
	return &dbMenuRepository{client}
}

func (dbMenuRepository *dbMenuRepository) GetMenu(ctx context.Context) *model.MenuResponse {
	menu := dbMenuRepository.readData(ctx)
	return menu
}

func (dbMenuRepository *dbMenuRepository) readData(ctx context.Context) *model.MenuResponse {
	var menuResponse model.MenuResponse

	collection := dbMenuRepository.client.Database("renkbench").Collection("menu")
	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		log.Fatal(err)
		return &menuResponse
	}
	defer cursor.Close(ctx)

	err = cursor.All(ctx, &menuResponse.Menu)
	if err != nil {
		log.Fatal(err)
		return &menuResponse
	}

	log.Printf("Loaded menu: %v", &menuResponse)
	return &menuResponse
}
