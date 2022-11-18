package handler

import (
	"encoding/json"
	"net/http"

	"renkbench.de/api/initilization"
	"renkbench.de/api/model"
)

func HandleVersion(writer http.ResponseWriter, request *http.Request) {
	buildNumber := initilization.GetBuildNumber()
	releaseNumber := initilization.GetReleaseNumber()
	version := model.Version{Version: initilization.VersionNumber, Build: buildNumber, Release: releaseNumber}
	json.NewEncoder(writer).Encode(version)
}
