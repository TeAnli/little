/** API 基础路径，通过 Vite 代理转发到后端 */
export const BASE_URL = '/api';

/**
 * 各模块 API 端点。
 * 使用函数形式处理带路径参数的端点，字符串形式处理固定端点。
 */
export const endpoints = {
  posts: {
    /** 文章列表（GET） / 创建文章（POST） */
    list: '/posts',
    /** 文章详情（GET） / 删除文章（DELETE） */
    detail: (slug: string) => `/posts/${encodeURIComponent(slug)}`,
    /** 文章评论（GET 列表 / POST 发表） */
    comments: (slug: string) => `/posts/${encodeURIComponent(slug)}/comments`,
  },
  /** 标签列表（GET） */
  tags: '/tags',
  /** 全文搜索（GET），q 为搜索关键词 */
  search: '/search',
} as const;
