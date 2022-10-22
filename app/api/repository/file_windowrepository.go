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

func (windowRepository *FileWindowRepository) GetWindows(ctx context.Context) *model.Windows {
	windows := windowRepository.readData()
	return windows
}

func (windowRepository *FileWindowRepository) GetWindowsByParentId(id int, ctx context.Context) *model.Windows {
	windows := windowRepository.readData()
	return windows
}

func (windowRepository *FileWindowRepository) readData() *model.Windows {
	jsonFile, err := os.Open("workbench.json")
	if err != nil {
		log.Println(err)
	}

	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)
	var windows *model.Windows
	json.Unmarshal(byteValue, windows)
	return windows
}
