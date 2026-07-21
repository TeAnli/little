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
	"time"

	"github.com/gin-gonic/gin"
)

type tokenEntry struct {
	createdAt time.Time
}

type AuthHandler struct {
	privateKey *rsa.PrivateKey
	publicKey  []byte
	tokens     map[string]tokenEntry
	mu         sync.RWMutex
}

const tokenTTL = 24 * time.Hour
const cleanupInterval = 1 * time.Hour

func NewAuthHandler() *AuthHandler {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	pubDER, _ := x509.MarshalPKIXPublicKey(&key.PublicKey)
	pubPEM := pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: pubDER})
	h := &AuthHandler{privateKey: key, publicKey: pubPEM, tokens: make(map[string]tokenEntry)}
	go h.cleanupLoop()
	return h
}

func (h *AuthHandler) cleanupLoop() {
	for {
		time.Sleep(cleanupInterval)
		h.mu.Lock()
		now := time.Now()
		for k, v := range h.tokens {
			if now.Sub(v.createdAt) > tokenTTL {
				delete(h.tokens, k)
			}
		}
		h.mu.Unlock()
	}
}

func (h *AuthHandler) PublicKey(c *gin.Context) {
	c.Header("Cache-Control", "public, max-age=3600")
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	plain, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, h.privateKey, encrypted, nil)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	pass := os.Getenv("ADMIN_PASSWORD")
	if pass == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	if string(plain) != pass {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	token := make([]byte, 32)
	rand.Read(token)
	tokenStr := hex.EncodeToString(token)

	h.mu.Lock()
	h.tokens[tokenStr] = tokenEntry{createdAt: time.Now()}
	h.mu.Unlock()

	c.JSON(http.StatusOK, gin.H{"token": tokenStr})
}

func (h *AuthHandler) Verify(c *gin.Context) {
	token := c.GetHeader("Authorization")
	if len(token) > 7 && token[:7] == "Bearer " {
		token = token[7:]
	}
	if token == "" || !h.ValidateToken(token) {
		c.JSON(http.StatusUnauthorized, gin.H{"valid": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"valid": true})
}

func (h *AuthHandler) ValidateToken(token string) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	e, ok := h.tokens[token]
	if !ok {
		return false
	}
	return time.Since(e.createdAt) < tokenTTL
}
