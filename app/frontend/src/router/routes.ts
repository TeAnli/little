// 路由配置 — 在此注册所有页面路由

import { registerRoutes } from './router';

registerRoutes([
  { pattern: '/',           page: 'home'   },
  { pattern: '/post/:slug', page: 'post'   },
  { pattern: '/tags',       page: 'tags'   },
  { pattern: '/tag/:tag',   page: 'tag'    },
  { pattern: '/search',     page: 'search' },
]);
