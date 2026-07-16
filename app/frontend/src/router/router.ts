export interface RouteConfig {
  /** 路径模式，如 '/post/:slug'，以 ':' 开头的段为动态参数 */
  pattern: string;
  /** 匹配后对应的页面标识 */
  page: string;
}

export interface ParsedRoute {
  /** 页面标识，对应 RouteConfig.page */
  page: string;
  /** 路径参数，如 { slug: 'hello-world' } */
  params: Record<string, string>;
  /** 查询参数，如 { q: 'keyword' } */
  query: Record<string, string>;
}

export type RouteChangeCallback = (route: ParsedRoute) => void;

const routes: RouteConfig[] = [];

/**
 * 注册单条路由
 * @example
 * registerRoute({ pattern: '/post/:slug', page: 'post' })
 */
export function registerRoute(config: RouteConfig): void {
  routes.push(config);
}

/**
 * 批量注册路由
 * @example
 * registerRoutes([
 *   { pattern: '/',           page: 'home' },
 *   { pattern: '/post/:slug', page: 'post' },
 * ])
 */
export function registerRoutes(configs: RouteConfig[]): void {
  routes.push(...configs);
}

// ---- 路由引擎 --------------------------------------------------------------

/**
 * 解析当前 URL hash 为结构化路由对象。
 * 依次用路由表中每条 pattern 匹配当前路径段，支持 ':param' 动态段。
 * 匹配失败时兜底返回 `{ page: 'home' }`。
 *
 * @example
 * parseHash() // => { page: 'post', params: { slug: 'hello-world' }, query: { lang: 'zh' } }
 */
export function parseHash(): ParsedRoute {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = raw.split('?');
  const segments = pathPart.split('/').filter(Boolean);

  const query: Record<string, string> = {};
  if (queryPart) {
    new URLSearchParams(queryPart).forEach((v, k) => {
      query[k] = v;
    });
  }

  for (const route of routes) {
    const routeSegs = route.pattern.split('/').filter(Boolean);
    if (routeSegs.length !== segments.length) continue;

    const params: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < routeSegs.length; i++) {
      if (routeSegs[i].startsWith(':')) {
        // 动态段 — 提取并解码路径参数
        params[routeSegs[i].slice(1)] = decodeURIComponent(segments[i]);
      } else if (routeSegs[i] !== segments[i]) {
        matched = false;
        break;
      }
    }

    if (matched) {
      return { page: route.page, params, query };
    }
  }

  return { page: 'home', params: {}, query };
}

/**
 * 导航到指定路径（设置 URL hash）
 * @example
 * navigate('/post/hello-world')
 */
export function navigate(path: string): void {
  location.hash = path;
}

/**
 * 监听路由变化。每次 hash 变化时自动调用 parseHash() 并触发回调。
 * @example
 * onRouteChange(route => console.log('当前页面：', route.page))
 */
export function onRouteChange(callback: RouteChangeCallback): void {
  window.addEventListener('hashchange', () => callback(parseHash()));
}
