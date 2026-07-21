import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getPosts, deletePost } from '../api';
import { isLoggedIn, logout, verifyToken } from '../services/auth';
import { navigate } from '../router/router';
import { formatDate } from '../utils/time';
import type { Post } from '../types';

@customElement('admin-page')
class AdminPage extends LitElement {
  @state() posts: Post[] = [];
  @state() loading = true;
  @state() page = 1;
  @state() total = 0;
  @state() confirmSlug = '';
  readonly size = 20;

  createRenderRoot() { return this; }

  async connectedCallback() {
    super.connectedCallback();
    if (!isLoggedIn() || !(await verifyToken())) { navigate('/login'); return; }
    this._load();
  }

  private async _load() {
    this.loading = true;
    try { const res = await getPosts(this.page, this.size); this.posts = res.posts; this.total = res.total; }
    catch { this.posts = []; }
    this.loading = false;
  }

  private _go(p: number) { this.page = p; this._load(); }

  private async _confirmDelete() {
    const slug = this.confirmSlug;
    this.confirmSlug = '';
    await deletePost(slug);
    this._load();
  }

  private get _pages() { return Math.max(1, Math.ceil(this.total / this.size)); }

  render() {
    return html`
      <div class="page-enter">
        <div class="flex items-center justify-between mb-8">
          <h1 class="font-serif text-2xl font-bold text-fg">管理后台 <span class="text-sm font-normal text-muted ml-2">${this.total} 篇</span></h1>
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
                    @click=${() => this.confirmSlug = p.slug}>删除</button>
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

        ${this.confirmSlug ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center" @click=${(e: Event) => { if (e.target === e.currentTarget) this.confirmSlug = ''; }}>
            <div class="drawer-overlay absolute inset-0"></div>
            <div class="card p-6 max-w-sm w-full mx-4 modal-enter relative z-10">
              <p class="text-fg font-medium mb-2">确认删除</p>
              <p class="text-sm text-muted mb-6">此操作不可撤销</p>
              <div class="flex justify-end gap-3">
                <button class="btn-ghost px-4 py-2 text-sm text-muted rounded-lg cursor-pointer" @click=${() => this.confirmSlug = ''}>取消</button>
                <button class="px-4 py-2 text-sm text-white rounded-lg cursor-pointer" style="background:rgb(var(--c-accent))" @click=${this._confirmDelete}>删除</button>
              </div>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }
}
