package repository

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"log"
	"os"

	"renkbench.de/api/model"
)

type FileWindowRepository struct{}

func (windowRepository *FileWindowRepository) GetWindows(ctx context.Context) *model.WindowResponse {
	windows := windowRepository.readData()
	return windows
}

func (windowRepository *FileWindowRepository) GetWindowById(id int, ctx context.Context) *model.Window {
	windows := windowRepository.readData()
	return &windows.Windows[0]
}

func (windowRepository *FileWindowRepository) readData() *model.WindowResponse {
	jsonFile, err := os.Open("workbench.json")
	if err != nil {
		log.Println(err)
	}

	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)
	var windows *model.WindowResponse
	json.Unmarshal(byteValue, windows)
	return windows
}
