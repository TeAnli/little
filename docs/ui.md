# UI 设计文档

## 设计体系

融合三种设计语言的精华，打造**极简、优雅、阅读优先**的个人博客：

| 来源 | 风格关键词 | 在本项目中的运用 |
|------|-----------|-----------------|
| **Swiss Modernism** | 网格系统、数学比例、无衬线、高对比 | 布局骨架、间距节奏、字体层级 |
| **Magic UI** | 圆角、微光、弹性动画、毛玻璃 | 卡片动效、hover 交互、页头模糊、渐变点缀 |
| **HeroUI** | 无边框卡片、柔和阴影、语义色板 | 组件质感、亮暗切换、焦点环、色彩体系 |

---

## 色彩系统

### 亮色模式 (Light)

| Token | 色值 | CSS 变量 | 用途 |
|-------|------|----------|------|
| Background | `#FAFAFA` | `--b1` | 页面底色 (zinc-50) |
| Surface | `#FFFFFF` | `--b2` | 卡片、容器背景 |
| Foreground | `#09090B` | `--bc` | 正文文字 (zinc-950) |
| Muted | `#71717A` | `--muted` | 次要文字、日期 (zinc-500) |
| Border | `#E4E4E7` | `--border` | 分割线、边框 (zinc-200) |
| Accent | `#18181B` | `--a` | 链接、按钮、标签 (zinc-900) |
| Accent Hover | `#3F3F46` | `--af` | hover 状态 (zinc-700) |

### 暗色模式 (Dark)

| Token | 色值 | CSS 变量 | 用途 |
|-------|------|----------|------|
| Background | `#09090B` | `--b1` | 页面底色 (zinc-950) |
| Surface | `#18181B` | `--b2` | 卡片、容器背景 (zinc-900) |
| Foreground | `#FAFAFA` | `--bc` | 正文文字 (zinc-50) |
| Muted | `#A1A1AA` | `--muted` | 次要文字 (zinc-400) |
| Border | `#27272A` | `--border` | 分割线、边框 (zinc-800) |
| Accent | `#FAFAFA` | `--a` | 链接、按钮 (zinc-50) |
| Accent Hover | `#E4E4E7` | `--af` | hover 状态 (zinc-200) |

---

## 字体系统

### 字体选型

| 角色 | 字体 | 字重 | Tailwind Class |
|------|------|------|----------------|
| 文章标题 | Noto Serif JP | 600 / 700 | `font-serif` |
| 正文 | Noto Sans JP | 300 / 400 / 500 | `font-sans` |
| 代码 | JetBrains Mono | 400 | `font-mono` |
| UI 标签 | Noto Sans JP | 500 | `font-sans font-medium` |

### 字体导入

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&family=Noto+Sans+JP:wght@300;400;500;700&family=Noto+Serif+JP:wght@400;600;700&display=swap');
```

### 排版层级

| 层级 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| h1 | 2.25rem (36px) | 1.3 | 700 | 文章标题 |
| h2 | 1.5rem (24px) | 1.4 | 600 | 文内大标题 |
| h3 | 1.25rem (20px) | 1.5 | 600 | 文内小标题 |
| body | 1.125rem (18px) | 1.8 | 400 | 正文阅读 |
| small | 0.875rem (14px) | 1.6 | 400 | 日期、辅助信息 |
| caption | 0.75rem (12px) | 1.5 | 500 | 标签、徽章 |

---

## 间距系统

基于 **8px 网格**，所有间距为 8 的倍数：

| Token | 值 | Tailwind | 用途 |
|-------|-----|----------|------|
| xs | 4px | `p-0.5` `gap-1` | 标签内边距、图标间距 |
| sm | 8px | `p-1` `gap-2` | 组件内部间距 |
| md | 16px | `p-2` `gap-4` | 卡片 padding、列表 gap |
| lg | 24px | `p-3` `gap-6` | 段落间距、区块间距 |
| xl | 32px | `p-4` `gap-8` | 大区块分隔 |
| 2xl | 48px | `p-6` `gap-12` | 页面级 section 间距 |
| 3xl | 64px | `p-8` `gap-16` | Hero 区域留白 |

---

## 组件风格 (Magic UI × HeroUI)

### 卡片 (Post Card)

```
HeroUI 风格：无边框、柔和阴影、大圆角
Magic UI 风格：hover 时微上浮 + 阴影加深 + 弹性动画

┌─────────────────────────────────────────────┐
│  bg-white dark:bg-zinc-900                  │
│  rounded-2xl                                │  ← HeroUI: large radius
│  shadow-sm border-0                         │  ← HeroUI: subtle shadow, no border
│  p-6                                        │
│                                             │
│  Title (font-serif text-xl font-semibold)   │
│  2024-01-15 · Summary text...               │
│  [tag] [tag]                                │
│                                             │
│  hover: -translate-y-1                      │  ← Magic UI: lift
│  hover: shadow-md                           │  ← Magic UI: deeper shadow
│  transition-all duration-300 ease-spring    │  ← Magic UI: spring
└─────────────────────────────────────────────┘
```

### 导航栏 (Header)

```
Magic UI 毛玻璃效果 + HeroUI 无边框设计

┌─────────────────────────────────────────────┐
│  bg-white/70 dark:bg-zinc-950/70            │  ← transparency
│  backdrop-blur-xl                           │  ← Magic UI: frosted glass
│  border-b border-zinc-200/50                │  ← HeroUI: subtle divider
│  dark:border-zinc-800/50                    │
│  sticky top-0 z-40                          │
│                                             │
│  [Logo]    Home  Tags    [🔍]  [🌓]         │
└─────────────────────────────────────────────┘
```

### 按钮

```
HeroUI 语义色 + Magic UI 交互动效

Primary:   bg-zinc-900 hover:bg-zinc-700 text-white
           dark:bg-zinc-100 dark:hover:bg-zinc-300 dark:text-zinc-900
           rounded-xl px-5 py-2.5 font-medium
           hover:scale-[1.02] active:scale-[0.98]      ← Magic UI: spring press
           transition-all duration-200

Ghost:     bg-transparent hover:bg-zinc-100
           dark:hover:bg-zinc-800
           rounded-xl px-4 py-2
           transition-colors duration-200
```

### 标签徽章 (Tag Badge)

```
HeroUI 轻量徽章

bg-zinc-100 dark:bg-zinc-800
text-zinc-600 dark:text-zinc-400
rounded-full px-3 py-0.5 text-xs font-medium
border-0
hover:bg-zinc-200 dark:hover:bg-zinc-700
transition-colors duration-200
```

### 搜索栏

```
HeroUI 无边框输入框 + subtle 阴影

bg-zinc-100 dark:bg-zinc-800
border-0 rounded-xl px-4 py-2.5
focus:ring-2 focus:ring-zinc-400/50            ← HeroUI: focus ring
focus:bg-white dark:focus:bg-zinc-700
transition-all duration-200
placeholder:text-zinc-400
```

### 评论卡片

```
嵌套回复缩进 + 左侧细线标识

顶级: bg-white dark:bg-zinc-900 rounded-xl p-4
子回复: ml-6 pl-4 border-l-2 border-zinc-200 dark:border-zinc-700
```

---

## 动画系统

### 弹性缓动 (Magic UI Spring)

```css
/* 在 Tailwind 中扩展 */
transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
/* hover 上浮、scale 按压都使用此曲线 */
```

### 页面过渡

| 场景 | 动画 | 时长 |
|------|------|------|
| 路由切换 | fade-in + slide-up (8px) | 250ms |
| 卡片入场 | stagger fade-in (每个延迟 50ms) | 300ms |
| Modal/搜索展开 | scale(0.95→1) + fade | 200ms |
| 主题切换 | 全局 transition colors | 300ms |
| 评论展开 | height auto + fade | 250ms |

### 微交互

- **hover 卡片**: `translateY(-4px)` + `shadow-lg`，spring 曲线
- **按压按钮**: `scale(0.97)`，50ms 快速响应
- **输入框聚焦**: ring 渐入，背景色过渡
- **链接**: underline 从中间展开 (background-size 动画)

---

## 响应式策略

| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| sm | < 640px | 单栏、导航折叠为汉堡菜单、正文 16px、边距 16px |
| md | 640-1024px | 导航展开、正文 18px、边距 24px |
| lg | > 1024px | 最大内容宽度 720px 居中、边距自适应 |

### 移动端特殊处理

- 导航：`drawer` 式侧滑菜单 (Magic UI 风格毛玻璃遮罩)
- 卡片：全宽、圆角缩小为 `rounded-xl`
- 正文：字号 16px、行高 1.75
- 评论区：子回复缩进减半 (`ml-3`)

---

## 页面路由

| 路由 | 页面组件 | 说明 |
|------|----------|------|
| `/` | `home-page` | 首页：文章列表，按日期倒序，支持分页 |
| `/post/:slug` | `post-page` | 文章详情：Markdown 渲染 + 评论区 |
| `/tags` | `tags-page` | 标签页：标签云，按文章数排序 |
| `/tags/:tag` | `home-page` | 标签筛选：带 `?tag=xxx` 过滤的文章列表 |
| `/search?q=xxx` | `search-page` | 搜索页：按关键词搜索标题和正文 |

---

## 组件树

```
<app>
├── <app-header>                    # 毛玻璃导航栏
│   ├── Logo (Noto Serif JP)
│   ├── Nav Links (Home / Tags)
│   ├── <search-bar>               # HeroUI 风格搜索框
│   └── <theme-switcher>           # 亮暗主题切换
│
├── <main class="max-w-3xl mx-auto px-4 md:px-6">
│   ├── <home-page>
│   │   └── <post-list>
│   │       └── <post-card> × N    # Magic UI hover 动效卡片
│   │           └── <tag-badge> × N
│   │
│   ├── <post-page>
│   │   ├── <article-header>       # 标题 + 元信息
│   │   ├── <markdown-viewer>      # Typography 渲染
│   │   └── <comment-section>
│   │       ├── <comment-form>     # HeroUI 风格表单
│   │       └── <comment-item> × N  # 嵌套回复
│   │
│   ├── <tags-page>
│   │   └── <tag-badge> × N        # 大小按计数缩放
│   │
│   └── <search-page>
│       └── <post-list>
│
└── <footer>                       # 极简页脚
    └── <rss-link>
```

---

## 首页线框图

```
┌────────────────────────────────────────────────────┐
│  [BlogName]  Home  Tags    [🔍 Search...]   [🌓]  │  ← frosted glass
├────────────────────────────────────────────────────┤
│                                                    │
│                    max-w-3xl mx-auto                │
│                                                    │
│   ┌──────────────────────────────────────────┐     │
│   │  ┌────────────────────────────────────┐  │     │
│   │  │  Getting Started with Lit           │  │     │  ← font-serif text-2xl
│   │  │  2024-02-20 · 摘要文字...          │  │     │  ← text-sm text-muted
│   │  │  [frontend] [lit]                  │  │     │  ← rounded-full badges
│   │  └────────────────────────────────────┘  │     │
│   └──────────────────────────────────────────┘     │
│                                                    │
│   ┌──────────────────────────────────────────┐     │
│   │  ┌────────────────────────────────────┐  │     │
│   │  │  Hello World                        │  │     │
│   │  │  2024-01-15 · Welcome to my blog!  │  │     │
│   │  │  [golang] [web]                     │  │     │
│   │  └────────────────────────────────────┘  │     │
│   └──────────────────────────────────────────┘     │
│                                                    │
│           ← Previous   1 / 3   Next →              │
│                                                    │
├────────────────────────────────────────────────────┤
│              RSS · Powered by Little Blog          │
└────────────────────────────────────────────────────┘
```

---

## 文章页线框图

```
┌────────────────────────────────────────────────────┐
│  [BlogName]  Home  Tags    [🔍 Search...]   [🌓]  │
├────────────────────────────────────────────────────┤
│                                                    │
│              max-w-3xl mx-auto                     │
│                                                    │
│   ┌──────────────────────────────────────────┐     │
│   │  # 文章标题 (font-serif text-4xl)        │     │
│   │  2024-01-15 · [golang] [web]            │     │
│   └──────────────────────────────────────────┘     │
│                                                    │
│   ─────────────────────────────────────────       │
│                                                    │
│   Markdown 正文渲染区域                            │
│   - h2: font-serif text-2xl mt-8 mb-4             │
│   - p: text-lg leading-relaxed mb-6               │
│   - code: font-mono bg-zinc-100 rounded-lg p-4    │
│   - blockquote: border-l-4 border-zinc-300 dark:border-zinc-600       │
│   - a: text-zinc-900 dark:text-zinc-100 underline underline-offset-2   │
│                                                    │
│   ─────────────────────────────────────────       │
│                                                    │
│   ┌─ 评论区 ─────────────────────────────────┐    │
│   │  Comments (3)                             │    │
│   │                                           │    │
│   │  ┌──────────────────────────────────┐     │    │
│   │  │  [username]  [email]             │     │    │
│   │  │  ┌──────────────────────────┐    │     │    │
│   │  │  │  Write a comment...      │    │     │    │
│   │  │  └──────────────────────────┘    │     │    │
│   │  │  [Submit]                         │     │    │
│   │  └──────────────────────────────────┘     │    │
│   │                                           │    │
│   │  ┌──────────────────────────────────┐     │    │
│   │  │  Alice · 2 hours ago             │     │    │
│   │  │  Great post!                     │     │    │
│   │  │  [Reply]                         │     │    │
│   │  │  ┌─ Bob · 1 hour ago             │     │    │
│   │  │  │  Agreed!                      │     │    │
│   │  │  │  [Reply]                      │     │    │
│   │  │  └───────────────────────────────│     │    │
│   │  └──────────────────────────────────┘     │    │
│   └───────────────────────────────────────────┘    │
│                                                    │
├────────────────────────────────────────────────────┤
│              RSS · Powered by Little Blog          │
└────────────────────────────────────────────────────┘
```

---

## 图标 (Iconify - Phosphor 系列)

| 用途 | 图标 | Iconify ID |
|------|------|------------|
| 亮色模式 | ☀️ | `ph:sun` |
| 暗色模式 | 🌙 | `ph:moon` |
| 搜索 | 🔍 | `ph:magnifying-glass` |
| 标签 | 🏷️ | `ph:tag` |
| RSS | 📡 | `ph:rss` |
| 回复 | ↩️ | `ph:arrow-bend-up-left` |
| 发送 | ➤ | `ph:paper-plane` |
| 时间 | 🕐 | `ph:clock` |
| 菜单 | ☰ | `ph:list` |
| 关闭 | ✕ | `ph:x` |
| 箭头左 | ← | `ph:caret-left` |
| 箭头右 | → | `ph:caret-right` |
| 外部链接 | ↗ | `ph:arrow-square-out` |
| 代码 | </> | `ph:code` |
| 复制 | 📋 | `ph:copy` |

---

## Tailwind 配置扩展

### 自定义弹性动画

```js
// tailwind.config.js
extend: {
  transitionTimingFunction: {
    'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  fontFamily: {
    serif: ['Noto Serif JP', 'serif'],
    sans: ['Noto Sans JP', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
}
```

### DaisyUI 主题配置

```js
daisyui: {
  themes: [
    {
      light: {
        "primary": "#18181B",        // zinc-900
        "primary-content": "#FAFAFA",
        "secondary": "#71717A",      // zinc-500
        "base-100": "#FAFAFA",       // zinc-50
        "base-200": "#FFFFFF",       // white
        "base-300": "#E4E4E7",       // zinc-200
        "base-content": "#09090B",   // zinc-950
        "neutral": "#3F3F46",        // zinc-700
        "neutral-content": "#FAFAFA",
        "--rounded-box": "1rem",
        "--rounded-btn": "0.75rem",
        "--rounded-badge": "9999px",
        "--animation-btn": "0.2s",
        "--animation-input": "0.2s",
      },
      dark: {
        "primary": "#FAFAFA",        // zinc-50
        "primary-content": "#09090B",
        "secondary": "#A1A1AA",      // zinc-400
        "base-100": "#09090B",       // zinc-950
        "base-200": "#18181B",       // zinc-900
        "base-300": "#27272A",       // zinc-800
        "base-content": "#FAFAFA",   // zinc-50
        "neutral": "#A1A1AA",
        "neutral-content": "#09090B",
        "--rounded-box": "1rem",
        "--rounded-btn": "0.75rem",
        "--rounded-badge": "9999px",
      },
    },
    "cupcake",
    "night",
  ],
}
```
