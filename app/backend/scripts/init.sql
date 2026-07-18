-- ============================================================
-- Little Blog — PostgreSQL 初始化脚本
-- 在 psql 中执行：\i scripts/init.sql
-- 或命令行：psql -U postgres -f scripts/init.sql
-- ============================================================

-- 1. 创建数据库用户（跳过如果已存在）
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'little') THEN
    CREATE ROLE little LOGIN PASSWORD 'little';
  END IF;
END
$$;

-- 2. 创建数据库（跳过如果已存在）
SELECT 'CREATE DATABASE little OWNER little'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'little')\gexec

-- 3. 连接到 little 数据库并创建表
\c little

CREATE TABLE IF NOT EXISTS comments (
    id         SERIAL PRIMARY KEY,
    post_slug  TEXT NOT NULL,
    parent_id  INT REFERENCES comments(id),
    username   TEXT NOT NULL,
    email      TEXT NOT NULL,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_slug);

-- 4. 授权
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO little;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO little;
