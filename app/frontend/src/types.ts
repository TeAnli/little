// ============ 数据模型类型 ============

export interface Post {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  content?: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  size: number;
}

export interface Tag {
  name: string;
  count: number;
}

export interface SearchResponse {
  results: Post[];
  total: number;
}

export interface Comment {
  id: number;
  post_slug: string;
  parent_id: number | null;
  username: string;
  email: string;
  content: string;
  created_at: string;
  replies: Comment[];
}

export interface CreatePostPayload {
  title: string;
  content: string;
  tags: string[];
  summary: string;
}

export interface CommentPayload {
  parent_id: number | null;
  username: string;
  email: string;
  content: string;
}
