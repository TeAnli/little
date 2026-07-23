import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getPosts } from '../api';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import { siteConfig } from '../config/site';
import type { Post } from '../types';

@customElement('home-page')
class HomePage extends LitElement {
  @state() posts: Post[] = [];
  @state() page = 1;
  @state() total = 0;
  @state() loading = true;
  @property({ type: String }) tag = '';

  size = 10;
  private _loaded = false;

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this._loaded) {
      this._loaded = true;
      this._load();
    }
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('tag') && this._loaded) {
      this.page = 1;
      this._load();
    }
  }

  private async _load() {
    this.loading = true;
    try {
      const res = await getPosts(this.page, this.size, this.tag || undefined);
      this.posts = res.posts;
      this.total = res.total;
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.posts = [];
      this.total = 0;
    } finally {
      this.loading = false;
    }
  }

  private _onPageChange(e: CustomEvent<{ page: number }>) {
    this.page = e.detail.page;
    this._load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private _scrollToPosts() {
    document.getElementById('latest-posts')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private _renderTagHeader() {
    return html`
      <div class="page-enter">
        <nav class="text-sm text-subtle mb-3">
          <a href="#/" class="hover:text-fg transition-colors cursor-pointer" @click=${() => navigate('/')}>Home</a>
          <span class="mx-1.5">/</span>
          <span class="text-muted">Tag</span>
        </nav>
        <div class="mb-14 md:mb-16">
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight">#${this.tag}</h1>
          <p class="text-muted mt-3 text-base">${this.total} 篇相关文章</p>
        </div>

        <post-list
          .posts=${this.posts}
          .page=${this.page}
          .total=${this.total}
          .size=${this.size}
          .loading=${this.loading}
          @page-change=${this._onPageChange}
        ></post-list>
      </div>
    `;
  }

  render() {
    if (this.tag) return this._renderTagHeader();

    return html`
      <div class="page-enter page-wide">
        <section class="home-hero">
          <div class="home-hero-copy">
            <p class="home-kicker">${siteConfig.hero.eyebrow}</p>
            <h1 class="font-serif text-4xl md:text-6xl font-bold text-fg leading-[1.08]">
              ${siteConfig.hero.title}
            </h1>
            <p class="text-muted mt-5 text-base md:text-lg leading-8 max-w-2xl">
              ${siteConfig.hero.subtitle}
            </p>
            <div class="flex flex-wrap items-center gap-3 mt-8">
              <button
                type="button"
                class="btn-primary micro-lift px-5 py-2.5 text-sm inline-flex items-center gap-2 group"
                @click=${this._scrollToPosts}
              >
                <span>阅读文章</span>
                <span class="transition-transform duration-300 group-hover:translate-y-0.5">${icons.arrowRight(15)}</span>
              </button>
              <a
                href="#/tags"
                class="btn-ghost micro-lift px-5 py-2.5 text-sm text-muted hover:text-fg inline-flex items-center gap-2 group"
                @click=${() => navigate('/tags')}
              >
                <span>浏览标签</span>
                <span class="transition-transform duration-300 group-hover:translate-x-0.5">${icons.tag(15)}</span>
              </a>
            </div>
          </div>

          <div class="home-hero-panel" aria-label="站点概览">
            <div class="home-stat">
              <span>文章</span>
              <strong>${this.loading ? '...' : this.total}</strong>
            </div>
            <div class="home-stat">
              <span>${siteConfig.social.github.label}</span>
              <a href=${siteConfig.social.github.url} target="_blank" rel="noreferrer">
                ${siteConfig.social.github.display}
              </a>
            </div>
            <div class="home-stat">
              <span>更新</span>
              <strong>${this.posts[0]?.date || '持续'}</strong>
            </div>
          </div>
        </section>

        <section id="latest-posts" class="home-posts">
          <div class="flex items-end justify-between gap-4 mb-8">
            <div>
              <p class="home-kicker">Latest</p>
              <h2 class="font-serif text-2xl md:text-3xl font-bold text-fg leading-tight">最新文章</h2>
            </div>
            <a
              href="#/tags"
              class="micro-lift text-sm text-muted hover:text-fg inline-flex items-center gap-1.5 group"
              @click=${() => navigate('/tags')}
            >
              <span>按标签查看</span>
              <span class="transition-transform duration-300 group-hover:translate-x-0.5">${icons.arrowRight(14)}</span>
            </a>
          </div>

          <post-list
            .posts=${this.posts}
            .page=${this.page}
            .total=${this.total}
            .size=${this.size}
            .loading=${this.loading}
            @page-change=${this._onPageChange}
          ></post-list>
        </section>
      </div>
    `;
  }
}
