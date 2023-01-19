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

func (windowRepository *dbWindowRepository) GetWindows(ctx context.Context) *model.WindowResponse {
	// db.windows.aggregate([{$match:{"parent":null}},{$graphLookup:{from:"windows",startWith:"$_id",connectFromField:"_id",connectToField:"parent",as:"children"}}])
	match := bson.D{{Key: "$match", Value: bson.D{
		{Key: "parent", Value: nil}}}}
	graphLookup := bson.D{
		{Key: "$graphLookup", Value: bson.D{
			{Key: "from", Value: "windows"},
			{Key: "startWith", Value: "$_id"},
			{Key: "connectFromField", Value: "id"},
			{Key: "connectToField", Value: "parent"},
			{Key: "as", Value: "children"}}}}

	cursor, err := windowRepository.getCollection().Aggregate(ctx, mongo.Pipeline{match, graphLookup})
	if err != nil {
		log.Fatal(err)
		return nil
	}

	windows := windowRepository.readData(cursor, ctx)
	return windows
}

func (windowRepository *dbWindowRepository) GetWindowById(id int, ctx context.Context) *model.Window {
	cursor, err := windowRepository.getCollection().Find(ctx, bson.D{{Key: "id", Value: id}})
	if err != nil {
		log.Fatal(err)
		return nil
	}
	defer cursor.Close(ctx)

	for cursor.Next(ctx) {
		var window model.Window
		err = cursor.Decode(&window)
		if err != nil {
			log.Fatal(err)
			return nil
		}
		return &window
	}
	err = cursor.Err()
	if err != nil {
		log.Fatal(err)
		return nil
	}
	return nil
}

func (windowRepository *dbWindowRepository) getCollection() *mongo.Collection {
	return windowRepository.client.Database("renkbench").Collection("windows")
}

func (windowRepository *dbWindowRepository) readData(cursor *mongo.Cursor, ctx context.Context) *model.WindowResponse {
	defer cursor.Close(ctx)

	var windowResponse model.WindowResponse

	err := cursor.All(ctx, &windowResponse.Windows)
	if err != nil {
		log.Fatal(err)
		return &windowResponse
	}

	log.Printf("Loaded windows: %v", &windowResponse)
	return &windowResponse
}
