package main

import (
	"context"
	"log"
	"net/http"
	"time"

	seed "renkbench.de/api/data"
	"renkbench.de/api/handler"
	"renkbench.de/api/middleware"
	"renkbench.de/api/mongodb"
	"renkbench.de/api/repository"
)

func initRoutes(mux *http.ServeMux) {
	ctx := context.Background()
	ctx, cancel := context.WithTimeout(ctx, time.Second*11)
	defer cancel()

	mongoClient := mongodb.Connect(mongodb.Connection{Uri: "mongodb://localhost:27017", Timeout: 10}, ctx)
	seed.Seed(mongoClient, ctx)
	windowRepository := repository.CreateDbWindowRepository(mongoClient)
	windowHandler := handler.CreateWindowHandler(windowRepository, "/api/windows/")
	mux.HandleFunc(windowHandler.RoutePrefix, windowHandler.Handle)
}

func main() {
	log.Println("Renkbench API started")

	mux := http.NewServeMux()
	initRoutes(mux)
	http.ListenAndServe(":8080", middleware.LoggingMiddleware(mux))
}
