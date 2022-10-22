// seed.go
package seed

import (
	"context"
	"log"

	"renkbench.de/api/model"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func Seed(client *mongo.Client, ctx context.Context) {
	seedWindows(client, ctx)
	seedMenu(client, ctx)
}

func seedWindows(client *mongo.Client, ctx context.Context) {
	collection := client.Database("renkbench").Collection("windows")
	result, err := collection.InsertOne(ctx, model.Window{nil, 1, 0, []model.Icon{}, model.WindowMetaInfo{"Renkbench"}, nil, nil})
	if err != nil {
		log.Fatal(err)
		return
	}

	id, ok := result.InsertedID.(primitive.ObjectID)
	if !ok {
		log.Fatalf("result.InsertedID with value %v is not of type primitive.ObjectID", result.InsertedID)
		return
	}

	data := []interface{}{
		model.Window{nil, 2, 0, []model.Icon{}, model.WindowMetaInfo{"Note!"}, nil, nil},
		model.Window{&id, 3, 1, []model.Icon{}, model.WindowMetaInfo{"Edit"}, nil, nil}}

	insertManyCollection(data, collection, client, ctx)
}

func seedMenu(client *mongo.Client, ctx context.Context) {

	data := []interface{}{
		model.Menu{"Renkbench", []model.MenuEntry{
			model.MenuEntry{"Open", "open", `[ {"property" : "isSelected", "value" : true } ]`},
			model.MenuEntry{"Close", "close", `[ {"property" : "isSelected", "value" : true }, {"property" : "isOpened", "value" : true } ]`}}},
		model.Menu{"Disk", []model.MenuEntry{
			model.MenuEntry{"Empty trash", "emptyTrash", `[ {"property" : "isSelected", "value" : true },  {"property" : "isTrashcan", "value" : true } ]`}}},
		model.Menu{"Special", []model.MenuEntry{
			model.MenuEntry{"Clean up", "cleanUp", `[ {"property" : "isSelected", "value" : true },  {"property" : "id", "value" : 1 } ]`}}}}

	insertManyName(data, "menu", client, ctx)
}

func insertManyName(data []interface{}, collectionName string, client *mongo.Client, ctx context.Context) {
	collection := client.Database("renkbench").Collection(collectionName)
	insertManyCollection(data, collection, client, ctx)
}

func insertManyCollection(data []interface{}, collection *mongo.Collection, client *mongo.Client, ctx context.Context) {
	_, err := collection.InsertMany(ctx, data)
	if err != nil {
		log.Fatal(err)
	}
}
