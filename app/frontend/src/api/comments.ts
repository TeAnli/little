import type { Comment, CommentPayload } from '../types';
import { endpoints } from './url';
import { request, post } from './client';

/**
 * 获取指定文章的评论列表。
 *
 * @param slug - 文章唯一标识
 * @returns 评论列表（含嵌套回复）
 */
export async function getComments(slug: string): Promise<Comment[]> {
  return request<Comment[]>(endpoints.posts.comments(slug));
}

/**
 * 发表评论或回复。
 *
 * @param slug    - 目标文章标识
 * @param payload - 评论内容（用户名、邮箱、正文、可选的父评论 ID）
 * @returns 新创建的评论对象
 */
export async function postComment(slug: string, payload: CommentPayload): Promise<Comment> {
  return post<Comment>(endpoints.posts.comments(slug), payload);
}
