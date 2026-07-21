package handler

import (
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct{}

func NewAuthHandler() *AuthHandler { return &AuthHandler{} }

type loginReq struct {
	Password string `json:"password"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	pass := os.Getenv("ADMIN_PASSWORD")
	if pass == "" {
		pass = "admin"
	}

	if req.Password != pass {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "wrong password"})
		return
	}

	// token 即 password（够简单）
	c.JSON(http.StatusOK, gin.H{"token": pass})
}
