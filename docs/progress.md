# 项目进度

> 随项目推进逐步更新。

---

## 更新日志

| 日期 | 更新 |
|------|------|
| 2026-07-16 | 路由系统重构：引擎/配置分离 |
| 2026-07-16 | 添加前端工具函数：主题管理、时间格式化、图标 |
| 2026-07-16 | 搭建前端工程骨架：Lit + Vite + Tailwind + TypeScript |
| 2026-07-15 | 项目初始化，5 份设计文档完成（api / ui / deployment / progress / project-structure） |

---

## 详细记录

### 2026-07-16

**路由系统**
- `router/router.ts`：路由管理器，提供 `registerRoute` / `registerRoutes` 注册、`parseHash` 解析、`navigate` 导航、`onRouteChange` 监听
- `router/routes.ts`：路由配置表，纯数组定义，语义清晰
- 引擎层不依赖配置层，支持动态追加路由配置

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
