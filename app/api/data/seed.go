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
	result, err := collection.InsertOne(ctx, model.Window{nil, 1, 0, []model.Icon{
		model.Icon{"Renkbench", model.Image{"workbench.png", 35, 30}, model.Image{"workbench_selected.png", 35, 30}}},
		model.WindowMetaInfo{"Renkbench"}, nil, nil})
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
		model.Window{nil, 2, 0, []model.Icon{
			model.Icon{"Double click me!", model.Image{"disk.png", 32, 32}, model.Image{"disk_selected.png", 32, 32}}},
			model.WindowMetaInfo{"Note!"}, &model.Content{getRef("Hello again!"),
				&[]model.Article{model.Article{"Renkbench relaunch", `Next release: During 2022 I had the idea of switching the backend from Node.js to Go. Since I started my <a href="https://github.com/renkman/mongotui" target="_blank">MongoTUI MongoDB client</a> in 2020, I felt like programming more stuff in Go. So - here it is. And with this move, I replaced the static file based JSON-content with a MongoDB.<br /><br />The source code of this web app is available on my <a href="https://github.com/renkman/Renkbench" target="_blank">Github repository</a>.`}}, nil}, nil},
		model.Window{&id, 3, 0, []model.Icon{
			model.Icon{"Edit", model.Image{"notepad.png", 32, 32}, model.Image{"notepad_selected.png", 32, 32}}}, model.WindowMetaInfo{"Edit"}, &model.Content{nil, nil, getRef(`<div class="textbox" tabindex="0"></div>`)}, nil}}

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

func getRef(value string) *string {
	return &value
}
