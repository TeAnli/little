package handler

import (
	"net/http"
	"strings"

	"little-blog/backend/internal/model"
	"little-blog/backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	repo *repository.CommentRepo
}

func NewCommentHandler(repo *repository.CommentRepo) *CommentHandler {
	return &CommentHandler{repo: repo}
}

func (h *CommentHandler) List(c *gin.Context) {
	comments, err := h.repo.ByPost(c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load comments"})
		return
	}
	c.JSON(http.StatusOK, comments)
}

func (h *CommentHandler) Create(c *gin.Context) {
	slug := c.Param("slug")
	var p model.CommentPayload
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	p.Username = strings.TrimSpace(p.Username)
	p.Email = strings.TrimSpace(p.Email)
	p.Content = strings.TrimSpace(p.Content)

	if p.Username == "" || p.Email == "" || p.Content == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username, email and content are required"})
		return
	}

	comment, err := h.repo.Create(slug, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create comment"})
		return
	}
	c.JSON(http.StatusCreated, comment)
}
