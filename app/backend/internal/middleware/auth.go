package middleware

import (
	"net/http"
	"strings"

	"little-blog/backend/internal/handler"

	"github.com/gin-gonic/gin"
)

func Auth(authH *handler.AuthHandler) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		token = strings.TrimPrefix(token, "Bearer ")

		if token == "" || !authH.ValidateToken(token) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			c.Abort()
			return
		}
		c.Next()
	}
}
