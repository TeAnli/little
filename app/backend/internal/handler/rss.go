package handler

import (
	"log"
	"net/url"
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
	title := env("SITE_TITLE", "Little Blog")
	siteURL := env("SITE_URL", "http://localhost")
	author := env("SITE_AUTHOR", "Little Blog")

	feed := &feeds.Feed{
		Title:       title,
		Link:        &feeds.Link{Href: siteURL},
		Description: title + " — A minimal blog",
		Created:     time.Now(),
	}

	for _, p := range h.repo.All() {
		if len(feed.Items) >= 20 {
			break
		}

		postURL, _ := url.JoinPath(siteURL, "/post/", p.Slug)
		t, err := time.Parse("2006-01-02", p.Date)
		if err != nil {
			t = time.Now()
		}

		feed.Items = append(feed.Items, &feeds.Item{
			Id:          postURL,
			Title:       p.Title,
			Link:        &feeds.Link{Href: postURL},
			Description: p.Summary,
			Content:     p.Content,
			Author:      &feeds.Author{Name: author},
			Created:     t,
		})
	}

	rss, err := feed.ToRss()
	if err != nil {
		log.Printf("RSS generation failed: %v", err)
		c.String(500, "RSS generation failed")
		return
	}
	c.Data(200, "application/rss+xml; charset=utf-8", []byte(rss))
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
