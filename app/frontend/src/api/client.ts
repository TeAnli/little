import axios from 'axios';
import { BASE_URL } from './url';

/**
 * Axios 实例配置
 * - 基础地址：从外部导入的 BASE_URL
 * - 默认请求头：Content-Type 为 application/json
 */
const http = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * 请求拦截器：自动附加 Authorization token
 */
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('little-blog-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 响应拦截器：统一错误处理
 * - 成功响应直接透传
 * - 失败时尝试从服务端响应的 error 字段提取错误信息，若不存在则使用 Axios 错误消息
 * - 最终统一抛出 Error 对象，便于上层统一捕获
 */
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.error || err.message
      : String(err);
    return Promise.reject(new Error(msg));
  },
);

/**
 * 执行 GET 请求并返回解析后的 JSON 数据
 * @template T - 期望的响应数据类型
 * @param url - 请求路径（相对于 baseURL）
 * @returns 响应数据
 */
export async function request<T>(url: string): Promise<T> {
  const res = await http.get<T>(url);
  return res.data;
}

/**
 * 执行 POST 请求并返回解析后的 JSON 数据
 * @template T - 期望的响应数据类型
 * @param url  - 请求路径（相对于 baseURL）
 * @param body - 请求体，以 JSON 格式发送
 * @returns 响应数据
 */
export async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await http.post<T>(url, body);
  return res.data;
}

/**
 * 执行 DELETE 请求并返回解析后的 JSON 数据
 * @template T - 期望的响应数据类型
 * @param url - 请求路径（相对于 baseURL）
 * @returns 响应数据
 */
export async function put<T>(url: string, body?: unknown): Promise<T> {
  const res = await http.put<T>(url, body);
  return res.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await http.delete<T>(url);
  return res.data;
}
