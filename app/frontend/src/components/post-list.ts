import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { icons } from '../utils/icons';
import type { Post } from '../types';

// 文章列表 — 编辑式，分隔线连接，含分页器
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
        <div class="flex flex-col">
          ${Array.from({ length: 3 }).map(
            () => html`
              <div class="py-7">
                <div class="shimmer h-3 rounded w-32 mb-3"></div>
                <div class="shimmer h-6 rounded w-3/4 mb-3"></div>
                <div class="shimmer h-4 rounded w-full mb-1.5"></div>
                <div class="shimmer h-4 rounded w-2/3"></div>
              </div>
              <div class="border-t hairline"></div>
            `
          )}
        </div>
      `;
    }

    if (this.posts.length === 0) {
      return html`
        <div class="py-20 text-center">
          <p class="text-muted text-base mb-1">还没有文章</p>
          <p class="text-sm text-subtle">敬请期待</p>
        </div>
      `;
    }

    return html`
      <div class="flex flex-col">
        ${this.posts.map((p, i) => html`
          ${i > 0 ? html`<div class="border-t hairline"></div>` : nothing}
          <post-card .post=${p} .index=${i}></post-card>
        `)}
      </div>
      ${this.totalPages > 1 ? this._renderPagination() : nothing}
    `;
  }

  private _renderPagination() {
    return html`
      <div class="flex items-center justify-between mt-14 pt-6 border-t hairline">
        <button
          class="btn-ghost micro-lift px-3 py-2 text-sm font-medium text-muted cursor-pointer flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed group"
          ?disabled=${this.page <= 1}
          @click=${() => this._changePage(-1)}
        >
          <span class="transition-transform duration-300 group-hover:-translate-x-0.5">${icons.caretLeft(14)}</span>
          <span>Previous</span>
        </button>
        <span class="text-sm text-subtle font-mono">${this.page} / ${this.totalPages}</span>
        <button
          class="btn-ghost micro-lift px-3 py-2 text-sm font-medium text-fg cursor-pointer flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed group"
          ?disabled=${this.page >= this.totalPages}
          @click=${() => this._changePage(1)}
        >
          <span>Next</span>
          <span class="transition-transform duration-300 group-hover:translate-x-0.5">${icons.caretRight(14)}</span>
        </button>
      </div>
    `;
  }
}
