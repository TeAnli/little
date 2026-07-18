package handler

import (
	"net/http"
	"strconv"

	"little-blog/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	svc *service.PostService
}

func NewPostHandler(svc *service.PostService) *PostHandler {
	return &PostHandler{svc: svc}
}

func (h *PostHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	tag := c.Query("tag")
	c.JSON(http.StatusOK, h.svc.List(tag, page, size))
}

func (h *PostHandler) Get(c *gin.Context) {
	post, ok := h.svc.Get(c.Param("slug"))
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "post not found"})
		return
	}
	c.JSON(http.StatusOK, post)
}
