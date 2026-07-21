import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { parseHash, onRouteChange, navigate, type ParsedRoute } from './router/router';
import './router/routes';
import { initTheme } from './utils/theme';

// 注册全部组件（副作用导入，触发 customElements.define）
import './components/app-header';
import './components/search-bar';
import './components/theme-switcher';
import './components/tag-badge';
import './components/rss-link';
import './components/post-card';
import './components/post-list';
import './components/markdown-viewer';
import './components/comment-item';
import './components/comment-form';
import './components/comment-section';

// 注册页面
import './pages/home-page';
import './pages/post-page';
import './pages/tags-page';
import './pages/search-page';
import './pages/login-page';
import './pages/admin-page';
import './pages/editor-page';

@customElement('blog-app')
class BlogApp extends LitElement {
  @state() route: ParsedRoute = parseHash();

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    initTheme();
    onRouteChange((r) => {
      this.route = r;
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
    // Cmd/Ctrl + K 由 <search-bar> 自身监听处理，无需在此重复绑定
  }

  private _renderPage() {
    const { params, query, render } = this.route;
    return render(params, query);
  }

  render() {
    // 用 route.page + 关键参数作为 key，确保页面切换时组件重建
    const { page, params, query } = this.route;
    const routeKey = `${page}:${params.slug || params.tag || query.q || ''}`;

    return html`
      <div class="min-h-dvh flex flex-col">
        <app-header></app-header>

        <main class="flex-1 w-full max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">
          ${this._renderKeyed(routeKey)}
        </main>

        <footer class="border-t border-line mt-16">
          <div class="max-w-3xl mx-auto px-4 md:px-6 py-10">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <p class="text-sm text-muted">
                © ${new Date().getFullYear()} Little Blog. Built with Lit + Vite.
              </p>
              <div class="flex items-center gap-4">
                <a
                  href="#/"
                  class="text-sm text-muted hover:text-fg link-underline cursor-pointer"
                  @click=${() => navigate('/')}
                >Home</a>
                <a
                  href="#/tags"
                  class="text-sm text-muted hover:text-fg link-underline cursor-pointer"
                  @click=${() => navigate('/tags')}
                >Tags</a>
                <rss-link></rss-link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;
  }

  // keyed 渲染：借助不同 key 让 lit 在路由切换时重建页面组件（触发入场动画与数据重载）
  private _renderKeyed(key: string) {
    return html`<div data-route-key=${key} class="page-outlet">${this._renderPage()}</div>`;
  }
}
