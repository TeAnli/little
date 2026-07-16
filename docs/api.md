# API 接口文档

## 基础信息

- Base URL: `http://localhost:8080/api`
- 请求格式: `application/json`
- 响应格式: `application/json`
- 字符编码: UTF-8

---

## 端点总览

| Method | Path | 说明 |
|--------|------|------|
| GET | `/api/posts` | 文章列表 |
| GET | `/api/posts/:slug` | 文章详情 |
| GET | `/api/tags` | 标签列表 |
| GET | `/api/search` | 搜索 |
| GET | `/api/rss` | RSS Feed |
| GET | `/api/posts/:slug/comments` | 评论列表 |
| POST | `/api/posts/:slug/comments` | 发表评论 |

---

## 1. 文章列表

```
GET /api/posts
```

### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tag` | string | 否 | 按标签筛选 |
| `page` | int | 否 | 页码，默认 1 |
| `size` | int | 否 | 每页条数，默认 10 |

### 响应示例

```json
{
  "posts": [
    {
      "slug": "hello-world",
      "title": "Hello World",
      "date": "2024-01-15",
      "tags": ["golang", "web"],
      "summary": "Welcome to my blog!"
    }
  ],
  "total": 2,
  "page": 1,
  "size": 10
}
```

---

## 2. 文章详情

```
GET /api/posts/:slug
```

### 响应示例

```json
{
  "slug": "hello-world",
  "title": "Hello World",
  "date": "2024-01-15",
  "tags": ["golang", "web"],
  "summary": "Welcome to my blog!",
  "content": "## Welcome\n\nThis is my first post.\n"
}
```

### 错误响应

```json
{
  "error": "post not found"
}
```
> HTTP 状态码: 404

---

## 3. 标签列表

```
GET /api/tags
```

### 响应示例

```json
[
  { "name": "golang", "count": 3 },
  { "name": "web", "count": 5 },
  { "name": "frontend", "count": 4 }
]
```
> 按 `count` 降序排列

---

## 4. 搜索

```
GET /api/search?q=keyword
```

### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `q` | string | 是 | 搜索关键词 |

### 响应示例

```json
{
  "results": [
    {
      "slug": "hello-world",
      "title": "Hello World",
      "date": "2024-01-15",
      "tags": ["golang", "web"],
      "summary": "Welcome to my blog! This is the first post."
    }
  ],
  "total": 1
}
```

> 搜索范围：标题 + 正文内容（不区分大小写的子串匹配）

---

## 5. RSS Feed

```
GET /api/rss
```

### 响应格式

`application/rss+xml`，标准 RSS 2.0 格式。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Little Blog</title>
    <link>http://localhost</link>
    <description>A simple blog</description>
    <item>
      <title>Hello World</title>
      <link>http://localhost/post/hello-world</link>
      <description>Welcome to my blog!</description>
      <pubDate>Mon, 15 Jan 2024 00:00:00 +0000</pubDate>
    </item>
  </channel>
</rss>
```

---

## 6. 获取评论

```
GET /api/posts/:slug/comments
```

### 响应示例

```json
[
  {
    "id": 1,
    "post_slug": "hello-world",
    "parent_id": null,
    "username": "Alice",
    "email": "alice@example.com",
    "content": "Great post!",
    "created_at": "2024-01-15T10:30:00Z",
    "replies": [
      {
        "id": 2,
        "post_slug": "hello-world",
        "parent_id": 1,
        "username": "Bob",
        "email": "bob@example.com",
        "content": "Agreed!",
        "created_at": "2024-01-15T11:00:00Z",
        "replies": []
      }
    ]
  }
]
```

> `parent_id` 为 `null` 的是顶级评论，`replies` 包含直接回复该评论的子评论。

---

## 7. 发表评论

```
POST /api/posts/:slug/comments
```

### 请求体

```json
{
  "parent_id": null,
  "username": "Alice",
  "email": "alice@example.com",
  "content": "Great post!"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `parent_id` | int/null | 否 | null = 顶级评论，数字 = 回复某条评论 |
| `username` | string | 是 | 用户名，1-50 字符 |
| `email` | string | 是 | 邮箱，需合法格式 |
| `content` | string | 是 | 评论内容，1-1000 字符 |

### 成功响应

```json
{
  "id": 3,
  "post_slug": "hello-world",
  "parent_id": null,
  "username": "Alice",
  "email": "alice@example.com",
  "content": "Great post!",
  "created_at": "2024-01-15T12:00:00Z",
  "replies": []
}
```
> HTTP 状态码: 201

### 错误响应

```json
{
  "error": "username is required"
}
```
> HTTP 状态码: 400

---

## 通用错误码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数有误 |
| 404 | 资源不存在 |
| 405 | 方法不允许 |
| 500 | 服务器内部错误 |
