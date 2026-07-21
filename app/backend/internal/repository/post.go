package repository

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"sort"
	"strings"
	"sync"
	"time"

	"little-blog/backend/internal/model"
)

type PostRepo struct {
	mu  sync.RWMutex
	db  *sql.DB
	all []*model.Post
}

func NewPostRepo(db *sql.DB) (*PostRepo, error) {
	r := &PostRepo{db: db}
	if err := r.refresh(); err != nil {
		return nil, err
	}
	return r, nil
}

func (r *PostRepo) refresh() error {
	rows, err := r.db.QueryContext(context.Background(),
		`SELECT slug, title, date, tags, summary, content FROM posts ORDER BY date DESC`)
	if err != nil {
		return err
	}
	defer rows.Close()

	var all []*model.Post
	for rows.Next() {
		var p model.Post
		var tagsJSON []byte
		if err := rows.Scan(&p.Slug, &p.Title, &p.Date, &tagsJSON, &p.Summary, &p.Content); err != nil {
			return err
		}
		json.Unmarshal(tagsJSON, &p.Tags)
		all = append(all, &p)
	}

	r.mu.Lock()
	r.all = all
	r.mu.Unlock()
	return nil
}

func (r *PostRepo) All() []*model.Post {
	r.mu.RLock()
	defer r.mu.RUnlock()
	out := make([]*model.Post, len(r.all))
	copy(out, r.all)
	return out
}

func (r *PostRepo) BySlug(slug string) (*model.Post, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, p := range r.all {
		if p.Slug == slug {
			return p, true
		}
	}
	return nil, false
}

func (r *PostRepo) Tags() []model.Tag {
	r.mu.RLock()
	defer r.mu.RUnlock()
	m := make(map[string]int)
	for _, p := range r.all {
		for _, t := range p.Tags {
			m[t]++
		}
	}
	tags := make([]model.Tag, 0, len(m))
	for name, count := range m {
		tags = append(tags, model.Tag{Name: name, Count: count})
	}
	sort.Slice(tags, func(i, j int) bool { return tags[i].Count > tags[j].Count })
	return tags
}

func (r *PostRepo) Create(p *model.Post) error {
	tagsJSON, _ := json.Marshal(p.Tags)
	_, err := r.db.ExecContext(context.Background(),
		`INSERT INTO posts (slug, title, date, tags, summary, content) VALUES ($1,$2,$3,$4,$5,$6)`,
		p.Slug, p.Title, p.Date, tagsJSON, p.Summary, p.Content)
	if err != nil {
		return err
	}
	return r.refresh()
}

func (r *PostRepo) Update(slug string, p *model.Post) error {
	tagsJSON, _ := json.Marshal(p.Tags)
	_, err := r.db.ExecContext(context.Background(),
		`UPDATE posts SET title=$1, date=$2, tags=$3, summary=$4, content=$5 WHERE slug=$6`,
		p.Title, p.Date, tagsJSON, p.Summary, p.Content, slug)
	if err != nil {
		return err
	}
	return r.refresh()
}

func (r *PostRepo) Delete(slug string) error {
	_, err := r.db.ExecContext(context.Background(), `DELETE FROM posts WHERE slug=$1`, slug)
	if err != nil {
		return err
	}
	return r.refresh()
}

func Slugify(title string) string {
	// keep ASCII alnum + dash, convert spaces to dash
	s := strings.ToLower(title)
	var b strings.Builder
	for _, r := range s {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			b.WriteRune(r)
		} else if r == ' ' || r == '_' {
			b.WriteRune('-')
		}
		// skip CJK and other non-ASCII (will be replaced by timestamp suffix if empty)
	}
	result := strings.Trim(b.String(), "-")
	if len(result) < 2 {
		result = fmt.Sprintf("post-%d", time.Now().UnixNano()/1e6)
	}
	return result
}

