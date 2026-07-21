/** API 统一入口 — 按业务模块重新导出 */

export { getPosts, getPost, createPost, updatePost, deletePost } from './posts';
export { getTags } from './tags';
export { search } from './search';
export { getComments, postComment } from './comments';
