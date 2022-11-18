package main

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"renkbench.de/api/handler"
	"renkbench.de/api/repository"
)

func TestRenkbenchAPIHandler(t *testing.T) {
	req, error := http.NewRequest("GET", "/api/windows", nil)
	if error != nil {
		t.Errorf("Unexpected error %v occured", error)
	}

	rec := httptest.NewRecorder()

	windowRepository := repository.FileWindowRepository{}
	windowHandler := handler.CreateWindowHandler(&windowRepository, "/api/windows")
	windowHandler.Handle(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("Expected status code %v, got %v instead", rec.Code, http.StatusOK)
	}
}
