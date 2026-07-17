# 项目进度

> 随项目推进逐步更新。

---

## 更新日志

| 日期 | 更新 |
|------|------|
| 2026-07-17 | 导航组件：app-header（毛玻璃+Drawer侧滑）、search-bar（Cmd+K快捷键） |
| 2026-07-17 | 评论组件：comment-section、comment-form、comment-item（表单验证+嵌套回复） |
| 2026-07-17 | 列表组件：post-card（卡片+stagger入场）、post-list（列表+分页+骨架屏+空状态） |
| 2026-07-17 | 页面实现：home-page、post-page、tags-page、search-page + markdown-viewer |
| 2026-07-16 | 数据库切换：SQLite → PostgreSQL (pgx)，更新 docker-compose 编排 |
| 2026-07-16 | 添加卡片&表情组件：post-card、tag-badge、theme-switcher、rss-link + 全局样式 + 类型定义 |
| 2026-07-16 | 路由系统优化：RouteConfig 内置 render |
| 2026-07-16 | API 层模块化：axios 客户端 + 文章 CRUD + 端点评级 |
| 2026-07-16 | 路由系统重构：引擎/配置分离 |
| 2026-07-16 | 添加前端工具函数：主题管理、时间格式化、图标 |
| 2026-07-16 | 搭建前端工程骨架：Lit + Vite + Tailwind + TypeScript |
| 2026-07-15 | 项目初始化，5 份设计文档完成（api / ui / deployment / progress / project-structure） |

---

## 详细记录

### 2026-07-17

**导航 & 搜索**
- `components/app-header.ts`：毛玻璃导航栏 + 桌面导航 + 移动端 Drawer 侧滑菜单 + 激活态高亮
- `components/search-bar.ts`：搜索输入框 — 回车/Cmd+K 触发导航 + focus 焦点样式

**评论组件**
- `components/comment-section.ts`：评论容器 — 加载评论列表 + 空状态 + 顶级发表表单
- `components/comment-form.ts`：评论表单 — 用户名/邮箱/内容字段 + 表单验证 + submit 事件
- `components/comment-item.ts`：单条评论 — 嵌套子回复展示 + 内联回复表单（点击 Reply 展开）

**列表组件**
- `components/post-card.ts`：文章卡片 — HeroUI 无边框 + Magic UI spring hover + stagger 入场动画，支持键盘导航
- `components/post-list.ts`：文章列表 — 骨架屏 loading + 空状态 + 分页器（Previous/Next）

**页面 & 渲染组件**
- `components/markdown-viewer.ts`：marked 库渲染 Markdown，自定义 `prose-blog` 排版样式
- `pages/home-page.ts`：首页 — 文章列表 + 分页 + 标签筛选 + loading 状态
- `pages/post-page.ts`：文章详情 — Markdown 正文 + 评论区 + 404 处理
- `pages/tags-page.ts`：标签云 — 按文章数排序 + 大小缩放 + 点击跳转
- `pages/search-page.ts`：搜索结果 — 关键词高亮 + 空状态 + 无结果提示

### 2026-07-16

**数据库 & 部署**
- `go.mod`：`mattn/go-sqlite3` → `jackc/pgx/v5`
- `.gitignore`：移除 `*.db`
- `docs/deployment.md`：docker-compose 新增 `db` 服务 (postgres:16-alpine)，环境变量 `DATABASE_URL`
- `docs/project-structure.md`：SQLite → PostgreSQL 全文替换
- 评论表 SQL：`INTEGER AUTOINCREMENT` → `SERIAL`，`DATETIME` → `TIMESTAMPTZ`

**卡片 & 表情组件**
- `components/post-card.ts`：文章卡片（HeroUI 无边框 + Magic UI spring hover + stagger 入场动画）
- `components/tag-badge.ts`：标签徽章（圆角药丸 + hover 变色）
- `components/theme-switcher.ts`：亮暗主题一键切换按钮
- `components/rss-link.ts`：RSS 订阅链接入口

**全局样式 & 类型**
- `global.css`：CSS 变量设计系统（base/surface/fg/muted/border/accent/ring）+ 亮暗双模式 + 组件类（frosted / card / badge / btn / input）+ 页面过渡动画 + prose-blog 文章排版
- `types.ts`：Post / Comment / Tag / API 响应类型 / 请求 payload

**前端工程配置**

**路由系统**
- `router/router.ts`：路由管理器，提供 `registerRoute` / `registerRoutes` 注册、`parseHash` 解析、`navigate` 导航、`onRouteChange` 监听
- `router/routes.ts`：路由配置表，纯数组定义，语义清晰
- `RouteConfig` 内置 `render` 函数，组件与属性绑定在 `routes.ts` 中完成，`app.ts`

**API 层**
- `api/url.ts`：BASE_URL + endpoints 端点配置，按模块分级管理
- `api/client.ts`：Axios 实例 + 请求/响应拦截器 + `request`（GET）/ `post`（POST）/ `del`（DELETE）封装
- `api/posts.ts`：文章 CRUD（`getPosts` / `getPost` / `createPost` / `deletePost`）
- `api/tags.ts`：标签列表 `getTags`
- `api/search.ts`：全文搜索 `search`
- `api/comments.ts`：评论 `getComments` / `postComment`
- `api/index.ts`：统一导出入口

**前端工具函数**
- `icons.ts`：Iconify 图标工具，Material Design Icon 风格图标
- `theme.ts`：亮/暗主题切换，支持 localStorage 持久化与系统偏好检测
- `time.ts`：相对时间格式化（如 "3 天前"、"刚刚" 等）

**前端工程骨架**
- Vite + TypeScript + Tailwind CSS + PostCSS 工程化配置
- 入口 HTML 与 `main.ts`
- Bun 作为包管理器

### 2026-07-15

**设计文档**
- `docs/api.md`：API 接口设计
- `docs/ui.md`：UI 设计系统
- `docs/deployment.md`：部署方案
- `docs/project-structure.md`：项目结构说明
- `docs/progress.md`：本文件（进度跟踪）
- `.gitignore`、`package.json`：仓库基础配置
