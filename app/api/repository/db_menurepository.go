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

func (dbMenuRepository *dbMenuRepository) GetMenu(ctx context.Context) *model.Menu {
	menu := dbMenuRepository.readData(ctx)
	return menu
}

func (dbMenuRepository *dbMenuRepository) readData(ctx context.Context) *model.Menu {
	var menu *model.Menu

	collection := dbMenuRepository.client.Database("renkbench").Collection("menu")
	cursor, err := collection.Find(ctx, bson.D{})
	if err != nil {
		log.Fatal(err)
		return menu
	}
	defer cursor.Close(ctx)

	err = cursor.All(ctx, menu)
	if err != nil {
		log.Fatal(err)
		return menu
	}

	log.Printf("Loaded menu: %v", menu)
	return menu
}
