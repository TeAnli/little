import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import type { Post } from '../types';

// 文章列表 — 含分页器
@customElement('post-list')
class PostList extends LitElement {
  @property({ type: Array }) posts: Post[] = [];
  @property({ type: Number }) page = 1;
  @property({ type: Number }) total = 0;
  @property({ type: Number }) size = 10;
  @property({ type: Boolean }) loading = false;

  createRenderRoot() {
    return this;
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.total / this.size));
  }

  private _changePage(delta: number) {
    const next = this.page + delta;
    if (next < 1 || next > this.totalPages) return;
    this.dispatchEvent(
      new CustomEvent('page-change', { detail: { page: next }, bubbles: true, composed: true })
    );
  }

  render() {
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

    if (this.posts.length === 0) {
      return html`
        <div class="card p-12 text-center">
          <p class="text-muted text-lg mb-2">还没有文章</p>
          <p class="text-sm text-muted">敬请期待</p>
        </div>
      `;
    }

    return html`
      <div class="flex flex-col gap-5">
        ${this.posts.map((p, i) => html`<post-card .post=${p} .index=${i}></post-card>`)}
      </div>
      ${this.totalPages > 1 ? this._renderPagination() : nothing}
    `;
  }

  private _renderPagination() {
    return html`
      <div class="flex items-center justify-center gap-4 mt-12 mb-4">
        <button
          class="btn-ghost px-4 py-2.5 rounded-xl text-sm font-medium text-muted cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          ?disabled=${this.page <= 1}
          @click=${() => this._changePage(-1)}
        >
          ${icons.caretLeft(14)}
          <span>Previous</span>
        </button>
        <span class="text-sm text-muted font-mono">${this.page} / ${this.totalPages}</span>
        <button
          class="btn-ghost px-4 py-2.5 rounded-xl text-sm font-medium text-fg cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          ?disabled=${this.page >= this.totalPages}
          @click=${() => this._changePage(1)}
        >
          <span>Next</span>
          ${icons.caretRight(14)}
        </button>
      </div>
    `;
  }
}
