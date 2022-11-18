package middleware

import (
	"log"
	"net/http"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		log.Printf("%v requested URL %v", request.Host, request.URL)
		next.ServeHTTP(writer, request)
	})
}
