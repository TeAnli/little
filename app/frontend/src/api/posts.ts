import type { Post, PostListResponse, CreatePostPayload } from '../types';
import { endpoints } from './url';
import { request, post, del } from './client';

/**
 * 获取分页文章列表。
 *
 * @param page - 页码，从 1 开始
 * @param size - 每页条数
 * @param tag  - 可选标签筛选
 * @returns 分页文章列表
 */
export async function getPosts(page = 1, size = 10, tag?: string): Promise<PostListResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (tag) params.set('tag', tag);
  return request<PostListResponse>(`${endpoints.posts.list}?${params}`);
}

/**
 * 获取单篇文章详情。
 *
 * @param slug - 文章唯一标识
 * @returns 文章对象
 */
export async function getPost(slug: string): Promise<Post> {
  return request<Post>(endpoints.posts.detail(slug));
}

/**
 * 创建新文章。
 *
 * @param payload - 文章内容（标题、正文、标签、摘要）
 * @returns 新创建的文章对象
 */
export async function createPost(payload: CreatePostPayload): Promise<Post> {
  return post<Post>(endpoints.posts.list, payload);
}

/**
 * 删除指定文章。
 *
 * @param slug - 文章唯一标识
 */
export async function deletePost(slug: string): Promise<void> {
  return del(endpoints.posts.detail(slug));
}
