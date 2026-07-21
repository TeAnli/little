package handler

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/hex"
	"encoding/pem"
	"net/http"
	"os"
	"sync"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	privateKey *rsa.PrivateKey
	publicKey  []byte
	tokens     map[string]bool // valid tokens
	mu         sync.RWMutex
}

func NewAuthHandler() *AuthHandler {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	pubDER, _ := x509.MarshalPKIXPublicKey(&key.PublicKey)
	pubPEM := pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: pubDER})
	return &AuthHandler{privateKey: key, publicKey: pubPEM, tokens: make(map[string]bool)}
}

func (h *AuthHandler) PublicKey(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"public_key": string(h.publicKey)})
}

type loginReq struct {
	Password string `json:"password"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	encrypted, err := base64.StdEncoding.DecodeString(req.Password)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid encoding"})
		return
	}

	plain, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, h.privateKey, encrypted, nil)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "wrong password"})
		return
	}

	pass := os.Getenv("ADMIN_PASSWORD")
	if pass == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server not configured"})
		return
	}

	if string(plain) != pass {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "wrong password"})
		return
	}

	token := make([]byte, 32)
	rand.Read(token)
	tokenStr := hex.EncodeToString(token)

	h.mu.Lock()
	h.tokens[tokenStr] = true
	h.mu.Unlock()

	c.JSON(http.StatusOK, gin.H{"token": tokenStr})
}

func (h *AuthHandler) ValidateToken(token string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.tokens[token]
}
