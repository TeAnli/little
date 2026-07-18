package main

import (
	"log"
	"os"

	"little-blog/backend/internal/db"
	"little-blog/backend/internal/handler"
	"little-blog/backend/internal/middleware"
	"little-blog/backend/internal/repository"
	"little-blog/backend/internal/service"

	"github.com/gin-gonic/gin"
)

func main() {
	database := db.Init()
	defer database.Close()

	contentDir := os.Getenv("CONTENT_DIR")
	if contentDir == "" {
		contentDir = "./content"
	}

	postRepo, err := repository.NewPostRepo(contentDir)
	if err != nil {
		log.Fatalf("failed to load posts: %v", err)
	}
	commentRepo := repository.NewCommentRepo(database)

	postSvc := service.NewPostService(postRepo)
	postH := handler.NewPostHandler(postSvc)
	tagH := handler.NewTagHandler(postSvc)
	searchH := handler.NewSearchHandler(postRepo)
	commentH := handler.NewCommentHandler(commentRepo)
	rssH := handler.NewRSSHandler(postRepo)

	r := gin.Default()
	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		api.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
		api.GET("/posts", postH.List)
		api.GET("/posts/:slug", postH.Get)
		api.GET("/posts/:slug/comments", commentH.List)
		api.POST("/posts/:slug/comments", commentH.Create)
		api.GET("/tags", tagH.List)
		api.GET("/search", searchH.Search)
		api.GET("/rss", rssH.Feed)
	}

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on :%s", port)
	r.Run(":" + port)
}
