package handler

import (
	"os"
	"time"

	"little-blog/backend/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/feeds"
)

type RSSHandler struct {
	repo *repository.PostRepo
}

func NewRSSHandler(repo *repository.PostRepo) *RSSHandler {
	return &RSSHandler{repo: repo}
}

func (h *RSSHandler) Feed(c *gin.Context) {
	title := os.Getenv("SITE_TITLE")
	if title == "" {
		title = "Little Blog"
	}
	siteURL := os.Getenv("SITE_URL")
	if siteURL == "" {
		siteURL = "http://localhost"
	}

	feed := &feeds.Feed{
		Title:       title,
		Link:        &feeds.Link{Href: siteURL},
		Description: "A minimal blog",
		Created:     time.Now(),
	}

	for _, p := range h.repo.All() {
		if len(feed.Items) >= 20 {
			break
		}
		t, _ := time.Parse("2006-01-02", p.Date)
		feed.Items = append(feed.Items, &feeds.Item{
			Title:       p.Title,
			Link:        &feeds.Link{Href: siteURL + "/post/" + p.Slug},
			Description: p.Summary,
			Created:     t,
		})
	}

	rss, _ := feed.ToRss()
	c.Data(200, "application/rss+xml; charset=utf-8", []byte(rss))
}
