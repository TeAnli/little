import type { TemplateResult } from 'lit';

/** 单条路由配置 */
export interface RouteConfig {
  /** 路径模式，如 '/post/:slug'，以 ':' 开头的段为动态参数 */
  pattern: string;
  /** 匹配后对应的页面标识 */
  page: string;
  /** 渲染函数 — 接收路径参数和查询参数，返回 Lit 模板 */
  render: (params: Record<string, string>, query: Record<string, string>) => TemplateResult;
}

/** 解析后的路由对象 */
export interface ParsedRoute {
  /** 页面标识 */
  page: string;
  /** 路径参数 */
  params: Record<string, string>;
  /** 查询参数 */
  query: Record<string, string>;
  /** 当前匹配路由的渲染函数 */
  render: (params: Record<string, string>, query: Record<string, string>) => TemplateResult;
}

/** 路由变化回调 */
export type RouteChangeCallback = (route: ParsedRoute) => void;

// ---- 内部路由表 ------------------------------------------------------------

const routes: RouteConfig[] = [];

/** 默认兜底渲染（首页） */
let fallbackRender: RouteConfig['render'] = () => {
  throw new Error('No routes registered and no fallback set');
};

/**
 * 批量注册路由。
 * 第一条注册的路由将作为未匹配时的兜底页。
 *
 * @example
 * registerRoutes([
 *   { pattern: '/',           page: 'home',   render: () => html`<home-page></home-page>` },
 *   { pattern: '/post/:slug', page: 'post',   render: (p) => html`<post-page .slug=${p.slug}></post-page>` },
 * ])
 */
export function registerRoutes(configs: RouteConfig[]): void {
  routes.push(...configs);
  // 第一条路由作为兜底
  if (routes.length > 0 && !fallbackRender.name) {
    fallbackRender = routes[0].render;
  }
}

/**
 * 注册单条路由。
 *
 * @example
 * registerRoute({ pattern: '/about', page: 'about', render: () => html`<about-page></about-page>` })
 */
export function registerRoute(config: RouteConfig): void {
  registerRoutes([config]);
}

// ---- 路由引擎 --------------------------------------------------------------

/**
 * 解析当前 URL hash 为结构化路由对象。
 * 依次用路由表中每条 pattern 匹配当前路径段，支持 ':param' 动态段。
 * 匹配失败时兜底返回第一条路由的渲染函数。
 *
 * @example
 * // URL: #/post/hello-world?lang=zh
 * parseHash() // => { page: 'post', params: { slug: 'hello-world' }, query: { lang: 'zh' }, render }
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
      return { page: route.page, params, query, render: route.render };
    }
  }

  return { page: 'home', params: {}, query, render: fallbackRender };
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
