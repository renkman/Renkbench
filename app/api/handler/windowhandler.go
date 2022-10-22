package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"renkbench.de/api/model"
)

type repository interface {
	GetWindows(ctx context.Context) *model.Windows
	GetWindowsByParentId(id int, ctx context.Context) *model.Windows
}

type windowHandler struct {
	repository  repository
	RoutePrefix string
}

func CreateWindowHandler(repository repository, routePrefix string) *windowHandler {
	return &windowHandler{repository, routePrefix}
}

func (windowhandler *windowHandler) Handle(writer http.ResponseWriter, request *http.Request) {
	id := windowhandler.getWindowId(request)
	var windows *model.Windows

	if id != nil {
		windows = windowhandler.repository.GetWindowsByParentId(*id, request.Context())
	} else {
		windows = windowhandler.repository.GetWindows(request.Context())
	}
	json.NewEncoder(writer).Encode(windows)
}

func (windowhandler *windowHandler) getWindowId(request *http.Request) *int {
	var routeId string
	if !strings.HasPrefix(request.URL.Path, windowhandler.RoutePrefix) {
		return nil
	}
	routeId = request.URL.Path[len(windowhandler.RoutePrefix):]
	id, err := strconv.Atoi(routeId)
	if err != nil {
		return nil
	}
	return &id
}
