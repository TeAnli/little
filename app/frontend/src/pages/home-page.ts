import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getPosts } from '../api';
import { navigate } from '../router/router';
import type { Post } from '../types';

@customElement('home-page')
class HomePage extends LitElement {
  @state() posts: Post[] = [];
  @state() page = 1;
  @state() total = 0;
  size = 10;
  @property({ type: String }) tag = '';
  @state() loading = true;

  createRenderRoot() {
    return this;
  }

  private _loaded = false;

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
    } catch {
      this.posts = [];
    } finally {
      this.loading = false;
    }
  }

  private _onPageChange(e: CustomEvent<{ page: number }>) {
    this.page = e.detail.page;
    this._load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    return html`
      <div class="page-enter">
        <!-- 精炼 hero：无 uppercase 标签，更大的呼吸 -->
        <div class="mb-14 md:mb-16">
          ${this.tag
            ? html`
                <nav class="text-sm text-subtle mb-3">
                  <a href="#/" class="hover:text-fg transition-colors cursor-pointer" @click=${() => navigate('/')}>Home</a>
                  <span class="mx-1.5">/</span>
                  <span class="text-muted">Tag</span>
                </nav>
                <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight">
                  #${this.tag}
                </h1>
                <p class="text-muted mt-3 text-base">
                  ${this.total} 篇相关文章
                </p>
              `
            : html`
                <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight">
                  思考与记录
                </h1>
                <p class="text-muted mt-3 text-base md:text-lg">
                  关于 Web 开发、工程实践与阅读笔记
                </p>
              `}
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
}
