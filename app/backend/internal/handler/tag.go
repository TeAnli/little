package handler

import (
	"net/http"

	"little-blog/backend/internal/service"

	"github.com/gin-gonic/gin"
)

type TagHandler struct {
	svc *service.PostService
}

func NewTagHandler(svc *service.PostService) *TagHandler {
	return &TagHandler{svc: svc}
}

func (h *TagHandler) List(c *gin.Context) {
	c.JSON(http.StatusOK, h.svc.Tags())
}
