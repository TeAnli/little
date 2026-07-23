import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { parseHash, onRouteChange, navigate, type ParsedRoute } from './router/router';
import './router/routes';
import { icons } from './utils/icons';
import { initTheme } from './utils/theme';
import { siteConfig } from './config/site';

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
  @state() scrollProgress = 0;
  @state() showBackTop = false;

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    initTheme();
    document.title = siteConfig.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', siteConfig.description);
    onRouteChange((route) => {
      this.route = route;
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
    window.addEventListener('scroll', this._onScroll);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this._onScroll);
  }

  private _onScroll = () => {
    const height = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = height > 0 ? Math.min(window.scrollY / height, 1) : 0;
    this.showBackTop = window.scrollY > 500;
  };

  private _renderPage() {
    const { params, query, render } = this.route;
    return render(params, query);
  }

  private _renderKeyed(key: string) {
    return html`<div data-route-key=${key} class="page-outlet">${this._renderPage()}</div>`;
  }

  render() {
    const { page, params, query } = this.route;
    const routeKey = `${page}:${params.slug || params.tag || query.q || ''}`;

    return html`
      <div class="reading-progress" style="transform:scaleX(${this.scrollProgress})"></div>
      ${this.showBackTop ? html`
        <button
          class="back-to-top"
          @click=${() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="返回顶部"
        >
          ${icons.arrowUp(16)}
        </button>
      ` : nothing}
      <div class="min-h-dvh flex flex-col">
        <app-header></app-header>

        <main class="flex-1 w-full max-w-6xl mx-auto px-5 md:px-6 py-12 md:py-20">
          ${this._renderKeyed(routeKey)}
        </main>

        <footer class="border-t hairline mt-20">
          <div class="max-w-3xl mx-auto px-5 md:px-6 py-10">
            <div class="flex flex-col md:flex-row items-center justify-between gap-4">
              <p class="text-sm text-subtle">
                ${siteConfig.footer.copyrightPrefix} ${new Date().getFullYear()} ${siteConfig.title}
              </p>
              <div class="flex items-center gap-6">
                <a
                  href="#/"
                  class="text-sm text-muted hover:text-fg transition-colors cursor-pointer"
                  @click=${() => navigate('/')}
                >Home</a>
                <a
                  href="#/tags"
                  class="text-sm text-muted hover:text-fg transition-colors cursor-pointer"
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
}
