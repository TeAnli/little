import type { SearchResponse } from '../types';
import { endpoints } from './url';
import { request } from './client';

/**
 * 全文搜索，匹配文章标题、摘要与正文。
 *
 * @param query - 搜索关键词
 * @returns 搜索结果列表及总数
 */
export async function search(query: string): Promise<SearchResponse> {
  return request<SearchResponse>(`${endpoints.search}?q=${encodeURIComponent(query)}`);
}
