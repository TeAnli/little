import type { Tag } from '../types';
import { endpoints } from './url';
import { request } from './client';

/**
 * 获取全部标签，按文章数量降序排列。
 *
 * @returns 标签列表
 */
export async function getTags(): Promise<Tag[]> {
  return request<Tag[]>(endpoints.tags);
}
