package handler

import (
	"net/http"
	"strings"

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
	var results []gin.H
	for _, p := range all {
		if strings.Contains(strings.ToLower(p.Title), q) ||
			strings.Contains(strings.ToLower(p.Content), q) {
			results = append(results, gin.H{
				"slug": p.Slug, "title": p.Title, "date": p.Date,
				"tags": p.Tags, "summary": p.Summary,
			})
		}
	}
	c.JSON(http.StatusOK, gin.H{"results": results, "total": len(results)})
}
