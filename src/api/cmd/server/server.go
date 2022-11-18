package main

import (
	"context"
	"log"
	"net/http"
	"time"

	"renkbench.de/api/handler"
	"renkbench.de/api/initilization"
	"renkbench.de/api/middleware"
	"renkbench.de/api/mongodb"
	"renkbench.de/api/repository"
)

func initRoutes(mux *http.ServeMux) {
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, time.Second*11)
	defer cancel()

	uri := initilization.BuildDatabaseUri()
	mongoClient := mongodb.Connect(mongodb.Connection{Uri: uri, Timeout: 10}, ctx)

	windowRepository := repository.CreateDbWindowRepository(mongoClient)
	windowHandler := handler.CreateWindowHandler(windowRepository, "/api/windows/")
	mux.HandleFunc(windowHandler.RoutePrefix, windowHandler.Handle)

	menuRepository := repository.CreateDbMenuRepository(mongoClient)
	menuHandler := handler.CreateMenuHandler(menuRepository)
	mux.HandleFunc("/api/menu", menuHandler.Handle)

	mux.HandleFunc("/api/version", handler.HandleVersion)

	fileServer := http.FileServer(http.Dir("../public"))
	mux.Handle("/", fileServer)
}

func main() {
	log.Println("Renkbench API started")

	mux := http.NewServeMux()
	initRoutes(mux)
	http.ListenAndServe(":8080", middleware.LoggingMiddleware(mux))
}
