package repository

import (
	"context"
	"database/sql"
	"time"

	"little-blog/backend/internal/model"
)

type CommentRepo struct{ db *sql.DB }

func NewCommentRepo(db *sql.DB) *CommentRepo { return &CommentRepo{db: db} }

func (r *CommentRepo) ByPost(slug string) ([]*model.Comment, error) {
	rows, err := r.db.QueryContext(context.Background(),
		`SELECT id, post_slug, parent_id, username, email, content, created_at
		 FROM comments WHERE post_slug=$1 ORDER BY created_at ASC`, slug)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flat []*model.Comment
	for rows.Next() {
		var c model.Comment
		var t time.Time
		if err := rows.Scan(&c.ID, &c.PostSlug, &c.ParentID, &c.Username, &c.Email, &c.Content, &t); err != nil {
			return nil, err
		}
		c.CreatedAt = t.Format(time.RFC3339)
		flat = append(flat, &c)
	}
	return nest(flat), nil
}

func nest(list []*model.Comment) []*model.Comment {
	byID := make(map[int64]*model.Comment)
	var roots []*model.Comment
	for _, c := range list {
		byID[c.ID] = c
	}
	for _, c := range list {
		if c.ParentID == nil {
			roots = append(roots, c)
		} else if p, ok := byID[*c.ParentID]; ok {
			p.Replies = append(p.Replies, c)
		}
	}
	return roots
}

func (r *CommentRepo) Create(slug string, p model.CommentPayload) (*model.Comment, error) {
	var c model.Comment
	var t time.Time
	err := r.db.QueryRowContext(context.Background(),
		`INSERT INTO comments (post_slug, parent_id, username, email, content)
		 VALUES ($1,$2,$3,$4,$5)
		 RETURNING id, post_slug, parent_id, username, email, content, created_at`,
		slug, p.ParentID, p.Username, p.Email, p.Content,
	).Scan(&c.ID, &c.PostSlug, &c.ParentID, &c.Username, &c.Email, &c.Content, &t)
	if err != nil {
		return nil, err
	}
	c.CreatedAt = t.Format(time.RFC3339)
	return &c, nil
}
