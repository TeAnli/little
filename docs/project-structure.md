# 项目目录结构

## 概述

`little` 是一个基于 Monorepo 架构的轻量级博客系统。前端使用 **Lit + Vite**，后端使用 **Golang**，以文件系统 Markdown 文件为文章数据源，SQLite 存储评论。

```
little/
├── app/
│   ├── frontend/          # Lit 前端应用
│   └── backend/           # Go 后端服务
├── scripts/               # Bun 脚本工具
├── docker/                # Docker 构建配置
├── docs/                  # 项目文档
└── package.json           # Monorepo 根配置 (Bun workspace)
```

---

## 目录详解

### `app/frontend/` — 前端

```
frontend/
├── src/
│   ├── components/        # 可复用的 Lit 组件
│   │   ├── app-header.ts        # 导航栏（Logo + 链接 + 搜索 + 主题切换）
│   │   ├── post-card.ts         # 文章卡片（标题、日期、摘要、标签）
│   │   ├── post-list.ts         # 文章列表（含分页）
│   │   ├── tag-badge.ts         # 标签徽章
│   │   ├── search-bar.ts        # 搜索输入框
│   │   ├── markdown-viewer.ts   # Markdown → HTML 渲染（marked）
│   │   ├── theme-switcher.ts    # 主题/主题色切换
│   │   ├── rss-link.ts          # RSS 订阅链接
│   │   ├── comment-section.ts   # 评论列表容器
│   │   ├── comment-form.ts      # 评论/回复表单
│   │   └── comment-item.ts      # 单条评论（含嵌套回复）
│   ├── pages/              # 页面级组件（对应路由）
│   │   ├── home-page.ts         # 首页
│   │   ├── post-page.ts         # 文章详情
│   │   ├── tags-page.ts         # 标签页
│   │   └── search-page.ts       # 搜索结果
│   ├── router/
│   │   └── router.ts            # 简易 SPA 路由（popstate）
│   ├── services/
│   │   └── api.ts               # API 客户端封装
│   ├── utils/
│   │   ├── theme.ts             # 主题持久化逻辑
│   │   └── time.ts              # 时间格式化
│   ├── app.ts               # 根组件
│   └── global.css            # 全局样式 / Tailwind 入口
├── public/                  # 静态资源
├── index.html               # HTML 入口
├── vite.config.ts            # Vite 配置
├── tsconfig.json             # TypeScript 配置
└── package.json              # 依赖声明
```

### `app/backend/` — 后端

```
server/
├── cmd/
│   └── server/
│       └── main.go          # 应用入口：初始化 DB、注册路由、启动服务
├── internal/
│   ├── handler/             # HTTP 处理器（薄层，只做参数解析和响应）
│   │   ├── post.go               # GET /api/posts, GET /api/posts/:slug
│   │   ├── tag.go                # GET /api/tags
│   │   ├── search.go             # GET /api/search
│   │   ├── rss.go                # GET /api/rss
│   │   └── comment.go            # GET/POST /api/posts/:slug/comments
│   ├── service/             # 业务逻辑层
│   │   ├── post.go               # 文章加载、过滤、分页
│   │   ├── search.go             # 搜索匹配
│   │   ├── rss.go                # RSS XML 生成
│   │   └── comment.go            # 评论校验、嵌套组装
│   ├── model/               # 数据结构定义
│   │   ├── post.go               # Post 结构体
│   │   └── comment.go            # Comment 结构体
│   ├── repository/          # 数据访问层
│   │   ├── post.go               # 读取/解析 Markdown 文件
│   │   └── comment.go            # SQLite CRUD
│   ├── db/
│   │   └── sqlite.go             # SQLite 连接 & 建表
│   └── middleware/
│       └── cors.go               # CORS 中间件
├── content/                 # Markdown 文章存放
│   └── posts/
│       └── *.md                  # 每篇文章一个 .md 文件
├── go.mod                   # Go 模块定义
└── go.sum                   # 依赖校验
```

### `scripts/` — 工具脚本

```bash
bun scripts/new-post.ts                    # 交互式创建新文章
bun scripts/new-post.ts --title "T" --tags "a,b"  # 命令行创建
bun scripts/list-posts.ts                  # 列出所有文章
```

### `docker/` — 容器化

| 文件 | 说明 |
|------|------|
| `Dockerfile.frontend` | 多阶段构建：bun build → nginx alpine |
| `Dockerfile.server` | 多阶段构建：go build → alpine |
| `docker-compose.yml` | 编排 frontend + server，挂载文章目录和 SQLite 数据 |

### `docs/` — 项目文档

| 文件 | 说明 |
|------|------|
| `ui.md` | UI 设计：路由、组件树、主题、布局 |
| `api.md` | API 接口文档：7 个端点 |
| `project-structure.md` | 本文档：目录结构与职责 |
| `progress.md` | 项目进度跟踪 |
| `deployment.md` | 部署指南：Docker 构建与运行 |

---

## 数据流

```
用户请求
    │
    ▼
┌──────────────┐     HTTP API      ┌──────────────┐
│  Lit SPA     │ ◄─────────────── │  Go Server   │
│  (Vite dev)  │                   │  (:8080)     │
│              │                   │              │
│  components  │                   │  handler/    │
│      │       │                   │      │       │
│  services/   │                   │  service/    │
│  api.ts      │                   │      │       │
│      │       │                   │  repository/ │
│      ▼       │                   │   │     │    │
│   marked     │                   │  .md   SQLite│
│  (渲染)      │                   │  文件   数据库 │
└──────────────┘                   └──────────────┘
```

1. **Go Server** 启动时加载所有 `.md` 文件到内存，初始化 SQLite
2. **Lit SPA** 通过 `api.ts` 请求 HTTP API 获取数据
3. **marked** 在前端将 Markdown 渲染为 HTML
4. 评论通过 API 写入 SQLite，读取时在后端组装为嵌套结构
