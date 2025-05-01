package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
)

//go:embed static/*
var static embed.FS

func main() {
	r := http.NewServeMux()

	content, err := fs.Sub(static, "static")
	if err != nil {
		log.Fatal(err)
	}

	r.Handle("GET /", http.FileServer(http.FS(content)))

	log.Fatal(http.ListenAndServe(":8080", r))
}
