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
		model.Window{nil, 2, 0, []model.Icon{}, model.WindowMetaInfo{"Note!"}, &model.Content{"Hello again!", nil,
			&[]model.Article{model.Article{"Renkbench relaunch", `Currently the Renkbench is just running with static content from a node.js service, since my webhost has updated the PHP version.<br/>I took advantage of the resulting downtime to refactor my Workbench Javascript code and added some missing features like window resizing, scrolling by arrow buttons and scrollbar and implementing the context menu.<br/>The new node.js backend is set up and hosted on Microsoft Azure. Accordingly, the build and deployment pipeline, feeded by the <a href="https://github.com/renkman/Renkbench" target="_blank">Github repository</a>, is setup on Azure Devops.<br/><br/>Now, I can go on with topaz style input possibilities and the content.`}}}, nil},
		model.Window{&id, 3, 1, []model.Icon{}, model.WindowMetaInfo{"Edit"}, &model.Content{}, nil}}

	insertManyCollection(data, collection, client, ctx)
}

func seedMenu(client *mongo.Client, ctx context.Context) {

	data := []interface{}{
		model.Menu{"Renkbench", []model.MenuEntry{
			model.MenuEntry{"Open", "open", `[ {"property" : "isSelected", "value" : true } ]`},
			model.MenuEntry{"Close", "close", `[ {"property" : "isSelected", "value" : true }, {"property" : "isOpened", "value" : true } ]`},
			model.MenuEntry{"Duplicate", "duplicate", `[ {"property" : "isSelected", "value" : true } ]`},
			model.MenuEntry{"Rename", "rename", `[ {"property" : "isSelected", "value" : true } ]`},
			model.MenuEntry{"Info", "info", `[ {"property" : "isSelected", "value" : true } ]`},
			model.MenuEntry{"Discard", "discard", `[ {"property" : "isSelected", "value" : true }, {"property" : "pid", "value" : 0, "operand": "greaterThan" }]`}}},
		model.Menu{"Disk", []model.MenuEntry{
			model.MenuEntry{"Empty trash", "emptyTrash", `[ {"property" : "isSelected", "value" : true },  {"property" : "isTrashcan", "value" : true } ]`},
			model.MenuEntry{"Initialize", "initialize", `[ {"property" : "isSelected", "value" : true },  {"property" : "pid", "value" : 0 } ]`}}},
		model.Menu{"Special", []model.MenuEntry{
			model.MenuEntry{"Clean up", "cleanUp", `[ {"property" : "isSelected", "value" : true },  {"property" : "id", "value" : 1 } ]`},
			model.MenuEntry{"Last error", "lastError", "true"},
			model.MenuEntry{"Redraw", "redraw", "true"},
			model.MenuEntry{"Snapshot", "snapshot", `[ {"property" : "isSelected", "value" : true } ]`},
			model.MenuEntry{"Version", "version", "true"}}}}

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
