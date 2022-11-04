package initilization

import (
	"fmt"
	"os"
)

const VersionNumber string = "1.3.3"

func GetBuildNumber() string {
	buildNumber := os.Getenv("BUILDNUMBER")
	if buildNumber != "" {
		return buildNumber
	}
	return "Build"
}

func GetReleaseNumber() string {
	releaseNumber := os.Getenv("RELEASENUMBER")
	if releaseNumber != "" {
		return releaseNumber
	}
	return "Release"
}

func BuildDatabaseUri() string {
	host, username, password := getDatabaseCredentials()
	uri := fmt.Sprintf("mongodb://%s:%s@%s", host, username, password)
	return uri
}

func getDatabaseCredentials() (string, string, string) {
	host := os.Getenv("DB_HOST")
	username := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	return host, username, password
}
