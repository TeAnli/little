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
        <div class="flex items-center justify-between mb-10">
          <div>
            <h1 class="font-serif text-2xl font-bold text-fg">管理后台</h1>
            <p class="text-sm text-subtle mt-1">共 ${this.total} 篇文章</p>
          </div>
          <div class="flex gap-2">
            <button class="btn-primary px-4 py-2 text-sm"
              @click=${() => navigate('/editor')}>写文章</button>
            <button class="btn-ghost px-4 py-2 text-sm text-muted"
              @click=${logout}>退出</button>
          </div>
        </div>

        ${this.loading ? html`<div class="py-6 animate-pulse"><div class="h-4 bg-hairline rounded w-1/2"></div></div>`
        : this.posts.length === 0 ? html`<div class="py-16 text-center text-muted">暂无文章</div>`
        : html`
          <div class="flex flex-col border-t hairline">
            ${this.posts.map(p => html`
              <div class="flex items-center justify-between gap-4 py-4 border-b hairline">
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-fg truncate">${p.title}</p>
                  <p class="text-xs text-subtle mt-1 font-mono">${formatDate(p.date)} · ${p.slug}</p>
                </div>
                <div class="flex gap-1 shrink-0">
                  <button class="btn-ghost px-3 py-1.5 text-xs text-fg"
                    @click=${() => navigate('/editor/' + p.slug)}>编辑</button>
                  <button class="btn-ghost px-3 py-1.5 text-xs text-red-500"
                    @click=${() => this.confirmSlug = p.slug}>删除</button>
                </div>
              </div>
            `)}
          </div>
        `}

        ${this._pages > 1 ? html`
          <div class="flex justify-center items-center gap-4 mt-10">
            <button class="btn-ghost px-3 py-1.5 text-sm text-muted" ?disabled=${this.page <= 1} @click=${() => this._go(this.page - 1)}>← 上一页</button>
            <span class="text-sm text-subtle font-mono">${this.page} / ${this._pages}</span>
            <button class="btn-ghost px-3 py-1.5 text-sm text-muted" ?disabled=${this.page >= this._pages} @click=${() => this._go(this.page + 1)}>下一页 →</button>
          </div>
        ` : nothing}

        ${this.confirmSlug ? html`
          <div class="fixed inset-0 z-50 flex items-center justify-center" @click=${(e: Event) => { if (e.target === e.currentTarget) this.confirmSlug = ''; }}>
            <div class="drawer-overlay overlay-enter absolute inset-0"></div>
            <div class="card p-6 max-w-sm w-full mx-4 modal-enter relative z-10">
              <p class="text-fg font-medium mb-2">确认删除</p>
              <p class="text-sm text-muted mb-6">此操作不可撤销</p>
              <div class="flex justify-end gap-3">
                <button class="btn-ghost px-4 py-2 text-sm text-muted" @click=${() => this.confirmSlug = ''}>取消</button>
                <button class="btn-primary px-4 py-2 text-sm" style="background:rgb(239 68 68)" @click=${this._confirmDelete}>删除</button>
              </div>
            </div>
          </div>
        ` : nothing}
      </div>
    `;
  }
}
