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
		dsn = "postgres://little:little@localhost:5432/little?sslmode=disable"
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}

	if err := db.PingContext(context.Background()); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}

	_, err = db.ExecContext(context.Background(), `
		CREATE TABLE IF NOT EXISTS comments (
			id         SERIAL PRIMARY KEY,
			post_slug  TEXT NOT NULL,
			parent_id  INT REFERENCES comments(id),
			username   TEXT NOT NULL,
			email      TEXT NOT NULL,
			content    TEXT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)
	`)
	if err != nil {
		log.Fatalf("failed to create tables: %v", err)
	}

	db.ExecContext(context.Background(), `CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_slug)`)

	fmt.Println("PostgreSQL connected")
	return db
}
