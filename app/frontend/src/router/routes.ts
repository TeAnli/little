import { html } from 'lit';
import { registerRoutes } from './router';

registerRoutes([
  { pattern: '/',            page: 'home',   render: () => html`<home-page></home-page>` },
  { pattern: '/post/:slug',  page: 'post',   render: (p) => html`<post-page .slug=${p.slug || ''}></post-page>` },
  { pattern: '/tags',        page: 'tags',   render: () => html`<tags-page></tags-page>` },
  { pattern: '/tag/:tag',    page: 'tag',    render: (p) => html`<home-page .tag=${p.tag || ''}></home-page>` },
  { pattern: '/search',      page: 'search', render: (_, q) => html`<search-page .q=${q.q || ''}></search-page>` },
  { pattern: '/login',       page: 'login',  render: () => html`<login-page></login-page>` },
  { pattern: '/admin',       page: 'admin',  render: () => html`<admin-page></admin-page>` },
  { pattern: '/editor/:slug', page: 'editor', render: (p) => html`<editor-page .slug=${p.slug || ''}></editor-page>` },
  { pattern: '/editor',      page: 'editor', render: () => html`<editor-page></editor-page>` },
]);
