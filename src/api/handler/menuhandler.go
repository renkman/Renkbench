package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"renkbench.de/api/model"
)

type menuRepository interface {
	GetMenu(ctx context.Context) *model.MenuResponse
}

type menuHandler struct {
	repository menuRepository
}

func CreateMenuHandler(repository menuRepository) *menuHandler {
	return &menuHandler{repository}
}

func (menuHandler *menuHandler) Handle(writer http.ResponseWriter, request *http.Request) {
	menu := menuHandler.repository.GetMenu(request.Context())
	json.NewEncoder(writer).Encode(menu)
}
