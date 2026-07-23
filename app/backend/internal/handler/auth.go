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
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type tokenEntry struct {
	createdAt time.Time
}

type loginAttempt struct {
	failures    int
	firstFailed time.Time
	lockedUntil time.Time
}

type AuthHandler struct {
	privateKey *rsa.PrivateKey
	publicKey  []byte
	tokens     map[string]tokenEntry
	attempts   map[string]loginAttempt
	mu         sync.RWMutex
}

const tokenTTL = 24 * time.Hour
const cleanupInterval = 1 * time.Hour
const loginRateLimitWindow = 15 * time.Minute
const loginRateLimitLockout = 15 * time.Minute
const loginRateLimitMaxFailures = 5

func NewAuthHandler() *AuthHandler {
	key, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		panic(err)
	}
	pubDER, _ := x509.MarshalPKIXPublicKey(&key.PublicKey)
	pubPEM := pem.EncodeToMemory(&pem.Block{Type: "PUBLIC KEY", Bytes: pubDER})
	h := &AuthHandler{
		privateKey: key,
		publicKey:  pubPEM,
		tokens:     make(map[string]tokenEntry),
		attempts:   make(map[string]loginAttempt),
	}
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
		for k, v := range h.attempts {
			if v.lockedUntil.IsZero() && now.Sub(v.firstFailed) > loginRateLimitWindow {
				delete(h.attempts, k)
				continue
			}
			if !v.lockedUntil.IsZero() && now.After(v.lockedUntil.Add(loginRateLimitWindow)) {
				delete(h.attempts, k)
			}
		}
		h.mu.Unlock()
	}
}

func (h *AuthHandler) PublicKey(c *gin.Context) {
	c.Header("Cache-Control", "no-cache")
	c.JSON(http.StatusOK, gin.H{"public_key": string(h.publicKey)})
}

type loginReq struct {
	Password string `json:"password"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	if retryAfter, limited := h.loginRetryAfter(c.ClientIP()); limited {
		c.Header("Retry-After", retryAfter)
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many login attempts"})
		return
	}

	var req loginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		h.recordLoginFailure(c.ClientIP())
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	pass := os.Getenv("ADMIN_PASSWORD")
	if pass == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var submitted string

	// Try RSA decrypt first (HTTPS); fall back to plaintext (HTTP)
	if encrypted, err := base64.StdEncoding.DecodeString(req.Password); err == nil {
		if decrypted, err := rsa.DecryptOAEP(sha256.New(), rand.Reader, h.privateKey, encrypted, nil); err == nil {
			submitted = string(decrypted)
		}
	}
	if submitted == "" {
		submitted = req.Password
	}

	if submitted != pass {
		h.recordLoginFailure(c.ClientIP())
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	token := make([]byte, 32)
	if _, err := rand.Read(token); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "server error"})
		return
	}
	tokenStr := hex.EncodeToString(token)

	h.mu.Lock()
	h.tokens[tokenStr] = tokenEntry{createdAt: time.Now()}
	delete(h.attempts, c.ClientIP())
	h.mu.Unlock()

	c.JSON(http.StatusOK, gin.H{"token": tokenStr})
}

func (h *AuthHandler) loginRetryAfter(ip string) (string, bool) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	attempt, ok := h.attempts[ip]
	if !ok || attempt.lockedUntil.IsZero() {
		return "", false
	}

	remaining := time.Until(attempt.lockedUntil)
	if remaining <= 0 {
		return "", false
	}
	return stringSeconds(remaining), true
}

func (h *AuthHandler) recordLoginFailure(ip string) {
	now := time.Now()

	h.mu.Lock()
	defer h.mu.Unlock()

	attempt := h.attempts[ip]
	if attempt.firstFailed.IsZero() || now.Sub(attempt.firstFailed) > loginRateLimitWindow {
		attempt = loginAttempt{firstFailed: now}
	}

	attempt.failures++
	if attempt.failures >= loginRateLimitMaxFailures {
		attempt.lockedUntil = now.Add(loginRateLimitLockout)
	}
	h.attempts[ip] = attempt
}

func stringSeconds(duration time.Duration) string {
	seconds := int(duration.Seconds())
	if seconds < 1 {
		seconds = 1
	}
	return strconv.Itoa(seconds)
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
