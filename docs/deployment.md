# 部署文档

## 概述

使用 Docker Compose 一键部署，包含两个服务：

- **frontend**: Nginx 托管 Lit SPA 静态文件
- **server**: Go 后端 API 服务

---

## 本地开发

### 前提条件

- [Bun](https://bun.sh) ≥ 1.x
- [Go](https://go.dev) ≥ 1.22
- [Docker](https://docker.com) (仅容器部署时需要)

### 启动后端

```bash
cd app/backend
go mod tidy
go run ./cmd/server
# 服务运行在 http://localhost:8080
```

### 启动前端

```bash
cd app/frontend
bun install
bun run dev
# 开发服务器运行在 http://localhost:5173
# API 请求自动代理到 :8080
```

---

## Docker 部署

### 项目文件结构

```
docker/
├── Dockerfile.frontend    # 前端镜像
├── Dockerfile.server      # 后端镜像
└── docker-compose.yml     # 服务编排
```

### Dockerfile.server

多阶段构建：

1. **构建阶段**: 使用 `golang:1.22-alpine`，编译 Go 二进制
2. **运行阶段**: 使用 `alpine:latest`，仅包含编译产物 + CGO 依赖

```dockerfile
# Stage 1: Build
FROM golang:1.22-alpine AS builder
RUN apk add --no-cache gcc musl-dev sqlite-dev
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=1 go build -o server ./cmd/server

# Stage 2: Run
FROM alpine:latest
RUN apk add --no-cache sqlite-libs
WORKDIR /app
COPY --from=builder /build/server .
COPY content/ ./content/
EXPOSE 8080
CMD ["./server"]
```

### Dockerfile.frontend

多阶段构建：

1. **构建阶段**: 使用 `oven/bun:alpine`，bun install + bun build
2. **运行阶段**: 使用 `nginx:alpine`，托管构建产物 + API 反向代理

```dockerfile
# Stage 1: Build
FROM oven/bun:alpine AS builder
WORKDIR /build
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Stage 2: Run
FROM nginx:alpine
COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### docker-compose.yml

```yaml
version: "3.8"
services:
  frontend:
    build:
      context: ./app/frontend
      dockerfile: ../../docker/Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - server

  server:
    build:
      context: ./app/backend
      dockerfile: ../../docker/Dockerfile.server
    ports:
      - "8080:8080"
    volumes:
      - ./app/backend/content:/app/content   # 文章热挂载
      - ./data:/app/data                         # SQLite 持久化
    environment:
      - DATA_DIR=/app/data
      - CONTENT_DIR=/app/content
```

---

## 启动 & 管理

### 一键部署

```bash
# 在项目根目录
docker-compose -f docker/docker-compose.yml up -d
```

### 查看日志

```bash
docker-compose -f docker/docker-compose.yml logs -f
```

### 停止

```bash
docker-compose -f docker/docker-compose.yml down
```

### 更新后重新构建

```bash
docker-compose -f docker/docker-compose.yml up -d --build
```

---

## 数据持久化

| 数据 | 存储位置 | 挂载方式 |
|------|----------|----------|
| 文章 (.md) | `app/backend/content/` | Docker volume 挂载到 `/app/content` |
| 评论 (SQLite) | `data/` | Docker volume 挂载到 `/app/data` |

> SQLite 数据库文件 `data/comments.db` 在容器重启后不丢失。

---

## 目录结构 (部署视角)

```
little/
├── app/backend/content/posts/*.md   ← 新增/修改文章只需编辑这里
├── data/comments.db                     ← SQLite 自动创建，持久化评论
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.server
│   └── docker-compose.yml               ← docker-compose -f 指向这里
└── ...
```

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SERVER_PORT` | `8080` | 后端监听端口 |
| `CONTENT_DIR` | `./content` | Markdown 文章目录 |
| `DATA_DIR` | `./data` | SQLite 数据库目录 |
| `SITE_TITLE` | `Little Blog` | 站点名称 |
| `SITE_URL` | `http://localhost` | 站点 URL (RSS 使用) |
