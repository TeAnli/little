package handler

import (
	"net/http"
	"strings"

	"little-blog/backend/internal/model"
	"little-blog/backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	repo *repository.PostRepo
}

func NewSearchHandler(repo *repository.PostRepo) *SearchHandler {
	return &SearchHandler{repo: repo}
}

func (h *SearchHandler) Search(c *gin.Context) {
	q := strings.ToLower(c.Query("q"))
	if q == "" {
		c.JSON(http.StatusOK, gin.H{"results": []any{}, "total": 0})
		return
	}

	all := h.repo.All()
	var results []model.Post
	for _, p := range all {
		if strings.Contains(strings.ToLower(p.Title), q) ||
			strings.Contains(strings.ToLower(p.Content), q) {
			results = append(results, model.Post{
				Slug: p.Slug, Title: p.Title, Date: p.Date,
				Tags: p.Tags, Summary: p.Summary,
			})
		}
	}
	c.JSON(http.StatusOK, gin.H{"results": results, "total": len(results)})
}
