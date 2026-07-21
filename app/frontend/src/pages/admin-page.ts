import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getPosts, deletePost } from '../api';
import { isLoggedIn, logout } from '../services/auth';
import { navigate } from '../router/router';
import { formatDate } from '../utils/time';
import type { Post } from '../types';

@customElement('admin-page')
class AdminPage extends LitElement {
  @state() posts: Post[] = [];
  @state() loading = true;
  @state() page = 1;
  @state() total = 0;
  readonly size = 20;

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    if (!isLoggedIn()) { navigate('/login'); return; }
    this._load();
  }

  private async _load() {
    this.loading = true;
    try {
      const res = await getPosts(this.page, this.size);
      this.posts = res.posts;
      this.total = res.total;
    } catch { this.posts = []; }
    this.loading = false;
  }

  private _go(p: number) {
    this.page = p;
    this._load();
  }

  private async _delete(slug: string) {
    if (!confirm('删除这篇文章？')) return;
    await deletePost(slug);
    this._load();
  }

  private get _pages() { return Math.max(1, Math.ceil(this.total / this.size)); }

  render() {
    return html`
      <div class="page-enter">
        <div class="flex items-center justify-between mb-8">
          <h1 class="font-serif text-2xl font-bold text-fg">管理后台</h1>
          <div class="flex gap-3">
            <button class="btn-primary px-4 py-2 text-sm text-white dark:text-black rounded-xl cursor-pointer"
              @click=${() => navigate('/editor')}>写文章</button>
            <button class="btn-ghost px-4 py-2 text-sm text-muted rounded-xl cursor-pointer"
              @click=${logout}>退出</button>
          </div>
        </div>

        ${this.loading ? html`<div class="card p-6 animate-pulse"><div class="h-4 bg-line rounded w-1/2"></div></div>`
        : this.posts.length === 0 ? html`<div class="card p-8 text-center text-muted">暂无文章</div>`
        : html`
          <div class="flex flex-col gap-3">
            ${this.posts.map(p => html`
              <div class="card p-5 flex items-center justify-between gap-4">
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-fg truncate">${p.title}</p>
                  <p class="text-xs text-muted mt-1">${formatDate(p.date)} · ${p.slug}</p>
                </div>
                <div class="flex gap-2 shrink-0">
                  <button class="btn-ghost px-3 py-1.5 text-xs text-fg rounded-lg cursor-pointer"
                    @click=${() => navigate('/editor/' + p.slug)}>编辑</button>
                  <button class="btn-ghost px-3 py-1.5 text-xs text-red-500 rounded-lg cursor-pointer"
                    @click=${() => this._delete(p.slug)}>删除</button>
                </div>
              </div>
            `)}
          </div>
        `}

        ${this._pages > 1 ? html`
          <div class="flex justify-center items-center gap-3 mt-8">
            <button class="btn-ghost px-3 py-1.5 text-sm text-muted rounded-lg cursor-pointer" ?disabled=${this.page <= 1} @click=${() => this._go(this.page - 1)}>← 上一页</button>
            <span class="text-sm text-muted">${this.page} / ${this._pages}</span>
            <button class="btn-ghost px-3 py-1.5 text-sm text-muted rounded-lg cursor-pointer" ?disabled=${this.page >= this._pages} @click=${() => this._go(this.page + 1)}>下一页 →</button>
          </div>
        ` : nothing}
      </div>
    `;
  }
}
