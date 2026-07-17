import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { search } from '../api';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import type { Post } from '../types';

// 搜索结果页 — 复用 post-card 渲染结果，含空状态与关键词回显
@customElement('search-page')
class SearchPage extends LitElement {
  @property({ type: String }) q = '';
  @state() results: Post[] = [];
  @state() total = 0;
  @state() loading = false;

  createRenderRoot() {
    return this;
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('q')) {
      this._search();
    }
  }

  private async _search() {
    const query = this.q.trim();
    if (!query) {
      this.results = [];
      this.total = 0;
      this.loading = false;
      return;
    }
    this.loading = true;
    try {
      const res = await search(query);
      this.results = res.results;
      this.total = res.total;
    } catch {
      this.results = [];
      this.total = 0;
    } finally {
      this.loading = false;
    }
  }

  render() {
    const hasQuery = this.q.trim().length > 0;
    return html`
      <div class="page-enter">
        <div class="mb-10">
          <p class="text-xs font-medium text-muted uppercase tracking-widest mb-3">Search</p>
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight">
            ${hasQuery ? html`搜索 <span class="text-accent">"${this.q}"</span>` : '搜索'}
          </h1>
          ${hasQuery && !this.loading
            ? html`<p class="text-muted mt-3 text-lg">找到 ${this.total} 篇相关文章</p>`
            : nothing}
        </div>

        ${this._renderBody(hasQuery)}
      </div>
    `;
  }

  private _renderBody(hasQuery: boolean) {
    if (!hasQuery) {
      return html`
        <div class="card p-12 text-center">
          <div class="flex justify-center mb-4 text-muted opacity-60">${icons.search(32)}</div>
          <p class="text-muted text-lg mb-2">输入关键词开始搜索</p>
          <p class="text-sm text-muted">按 <kbd class="kbd">Cmd/Ctrl</kbd> + <kbd class="kbd">K</kbd> 快速唤起搜索框</p>
        </div>
      `;
    }

    if (this.loading) {
      return html`
        <div class="flex flex-col gap-5">
          ${Array.from({ length: 3 }).map(
            () => html`
              <div class="card p-6 animate-pulse">
                <div class="h-6 bg-line rounded w-3/4 mb-3"></div>
                <div class="h-4 bg-line rounded w-1/4 mb-4"></div>
                <div class="h-4 bg-line rounded w-full mb-2"></div>
                <div class="h-4 bg-line rounded w-2/3"></div>
              </div>
            `
          )}
        </div>
      `;
    }

    if (this.results.length === 0) {
      return html`
        <div class="card p-12 text-center">
          <div class="flex justify-center mb-4 text-muted opacity-60">${icons.search(32)}</div>
          <p class="text-muted text-lg mb-2">没有找到相关文章</p>
          <p class="text-sm text-muted mb-6">换个关键词试试吧</p>
          <button
            class="btn-ghost px-4 py-2 rounded-xl text-sm text-fg cursor-pointer"
            @click=${() => navigate('/')}
          >
            返回首页
          </button>
        </div>
      `;
    }

    return html`
      <div class="flex flex-col gap-5">
        ${this.results.map((p, i) => html`<post-card .post=${p} .index=${i}></post-card>`)}
      </div>
    `;
  }
}
