package handler

import (
	"net/http"
	"regexp"
	"strings"
	"sync"
	"time"

	"little-blog/backend/internal/model"
	"little-blog/backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	repo     *repository.CommentRepo
	rateMap  map[string]time.Time
	rateMu   sync.Mutex
}

func NewCommentHandler(repo *repository.CommentRepo) *CommentHandler {
	h := &CommentHandler{repo: repo, rateMap: make(map[string]time.Time)}
	go func() {
		for {
			time.Sleep(10 * time.Minute)
			h.rateMu.Lock()
			now := time.Now()
			for k, v := range h.rateMap {
				if now.Sub(v) > 30*time.Minute {
					delete(h.rateMap, k)
				}
			}
			h.rateMu.Unlock()
		}
	}()
	return h
}

var emailRegex = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]+$`)

func (h *CommentHandler) List(c *gin.Context) {
	comments, err := h.repo.ByPost(c.Param("slug"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load comments"})
		return
	}
	maskEmails(comments)
	c.JSON(http.StatusOK, comments)
}

func (h *CommentHandler) Create(c *gin.Context) {
	slug := c.Param("slug")

	ip := c.ClientIP()
	h.rateMu.Lock()
	if last, ok := h.rateMap[ip]; ok && time.Since(last) < 10*time.Second {
		h.rateMu.Unlock()
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "too fast, wait 10 seconds"})
		return
	}
	h.rateMap[ip] = time.Now()
	h.rateMu.Unlock()

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
	if len(p.Username) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username too long"})
		return
	}
	if len(p.Content) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "content too long"})
		return
	}
	if !emailRegex.MatchString(p.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email"})
		return
	}

	comment, err := h.repo.Create(slug, p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create comment"})
		return
	}
	comment.Email = mask(comment.Email)
	c.JSON(http.StatusCreated, comment)
}

func maskEmails(comments []*model.Comment) {
	for _, c := range comments {
		c.Email = mask(c.Email)
		maskEmails(c.Replies)
	}
}

func mask(email string) string {
	parts := strings.SplitN(email, "@", 2)
	if len(parts) != 2 {
		return email
	}
	name := parts[0]
	if len(name) <= 2 {
		return name + "***@" + parts[1]
	}
	return name[:2] + "***@" + parts[1]
}
