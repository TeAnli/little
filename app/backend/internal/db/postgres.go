package db

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func Init() *sql.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is required")
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}

	if err := db.PingContext(context.Background()); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}

	migrate(db)
	fmt.Println("PostgreSQL connected")
	return db
}

func migrate(db *sql.DB) {
	ctx := context.Background()

	_, err := db.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS posts (
			slug       TEXT PRIMARY KEY,
			title      TEXT NOT NULL,
			date       TEXT NOT NULL,
			tags       JSONB NOT NULL DEFAULT '[]',
			summary    TEXT NOT NULL DEFAULT '',
			content    TEXT NOT NULL DEFAULT ''
		);

		CREATE TABLE IF NOT EXISTS comments (
			id         SERIAL PRIMARY KEY,
			post_slug  TEXT NOT NULL REFERENCES posts(slug) ON DELETE CASCADE,
			parent_id  INT REFERENCES comments(id) ON DELETE CASCADE,
			username   TEXT NOT NULL,
			email      TEXT NOT NULL,
			content    TEXT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		);

		CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_slug);
	`)
	if err != nil {
		log.Fatalf("migration failed: %v", err)
	}

	// Seed sample data if empty
	var count int
	db.QueryRowContext(ctx, `SELECT COUNT(*) FROM posts`).Scan(&count)
	if count == 0 {
		db.ExecContext(ctx, `INSERT INTO posts (slug, title, date, tags, summary, content) VALUES
			('hello-world', 'Hello World', '2024-01-15', '["golang","web"]', 'Welcome to my blog!', '## Welcome\n\nThis is my first blog post.'),
			('getting-started-with-lit', 'Getting Started with Lit', '2024-02-20', '["frontend","lit"]', 'Learn web components with Lit.', '## What is Lit?\n\nLit is a simple library for building fast web components.')
		`)
	}
}
