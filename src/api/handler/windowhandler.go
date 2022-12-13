package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"renkbench.de/api/model"
)

type windowRepository interface {
	GetWindows(ctx context.Context) *model.WindowResponse
	GetWindowById(id int, ctx context.Context) *model.Window
}

type windowHandler struct {
	repository  windowRepository
	RoutePrefix string
}

func CreateWindowHandler(repository windowRepository, routePrefix string) *windowHandler {
	return &windowHandler{repository, routePrefix}
}

func (windowHandler *windowHandler) Handle(writer http.ResponseWriter, request *http.Request) {
	id := windowHandler.getWindowId(request)

	if id != nil {
		window := windowHandler.repository.GetWindowById(*id, request.Context())
		json.NewEncoder(writer).Encode(window)
		return
	}

	windows := windowHandler.repository.GetWindows(request.Context())
	json.NewEncoder(writer).Encode(windows)
}

func (windowHandler *windowHandler) getWindowId(request *http.Request) *int {
	var routeId string
	if !strings.HasPrefix(request.URL.Path, windowHandler.RoutePrefix) {
		return nil
	}
	routeId = request.URL.Path[len(windowHandler.RoutePrefix):]
	id, err := strconv.Atoi(routeId)
	if err != nil {
		return nil
	}
	return &id
}
