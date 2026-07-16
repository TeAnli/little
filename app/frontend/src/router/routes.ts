// 路由配置 — 在此定义所有页面路由及其渲染方式

import { html } from 'lit';
import { registerRoutes } from './router';


registerRoutes([
  {
    pattern: '/',
    page: 'home',
    render: () => html`<home-page></home-page>`,
  },
  {
    pattern: '/post/:slug',
    page: 'post',
    render: (params) => html`<post-page .slug=${params.slug || ''}></post-page>`,
  },
  {
    pattern: '/tags',
    page: 'tags',
    render: () => html`<tags-page></tags-page>`,
  },
  {
    pattern: '/tag/:tag',
    page: 'tag',
    render: (params) => html`<home-page .tag=${params.tag || ''}></home-page>`,
  },
  {
    pattern: '/search',
    page: 'search',
    render: (_, query) => html`<search-page .q=${query.q || ''}></search-page>`,
  },
]);
