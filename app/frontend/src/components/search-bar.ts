import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { search as searchApi } from '../api';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import type { Post } from '../types';

// 搜索栏 — 触发按钮 + 展开式 Modal（精致极简）
@customElement('search-bar')
class SearchBar extends LitElement {
  @state() open = false;
  @state() query = '';
  @state() results: Post[] = [];
  @state() loading = false;

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this._onKeydown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKeydown);
  }

  private _onKeydown = (e: KeyboardEvent) => {
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      this.openModal();
    }
    if (e.key === 'Escape' && this.open) {
      this.closeModal();
    }
  };

  openModal() {
    this.open = true;
    requestAnimationFrame(() => {
      const input = this.querySelector('#search-input') as HTMLInputElement | null;
      input?.focus();
    });
  }

  closeModal() {
    this.open = false;
    this.query = '';
    this.results = [];
  }

  private async _onInput(e: InputEvent) {
    this.query = (e.target as HTMLInputElement).value;
    if (!this.query.trim()) {
      this.results = [];
      return;
    }
    this.loading = true;
    try {
      const res = await searchApi(this.query);
      this.results = res.results.slice(0, 6);
    } catch {
      this.results = [];
    } finally {
      this.loading = false;
    }
  }

  private _goToPost(slug: string) {
    this.closeModal();
    navigate(`/post/${slug}`);
  }

  private _submitSearch() {
    if (!this.query.trim()) return;
    this.closeModal();
    navigate(`/search?q=${encodeURIComponent(this.query)}`);
  }

  render() {
    return html`
      <button
        class="btn-ghost micro-lift p-2 rounded-[var(--radius-btn)] text-muted hover:text-fg cursor-pointer group"
        @click=${() => this.openModal()}
        aria-label="搜索文章"
      >
        <span class="block transition-transform duration-300 group-hover:scale-110">${icons.search(18)}</span>
      </button>

      ${this.open
        ? html`
            <div class="fixed inset-0 z-50" @click=${(e: Event) => {
              if (e.target === e.currentTarget) this.closeModal();
            }}>
              <div class="drawer-overlay overlay-enter absolute inset-0"></div>
              <div class="relative max-w-xl mx-auto mt-[12vh] px-4 modal-enter">
                <div class="bg-surface rounded-2xl overflow-hidden border hairline" style="box-shadow: var(--shadow-lg)">
                  <div class="flex items-center gap-3 px-5 py-4 border-b hairline">
                    <span class="text-subtle shrink-0">${icons.search(18)}</span>
                    <input
                      id="search-input"
                      type="text"
                      placeholder="搜索文章..."
                      .value=${this.query}
                      @input=${this._onInput}
                      @keydown=${(e: KeyboardEvent) => {
                        if (e.key === 'Enter') this._submitSearch();
                      }}
                      class="flex-1 bg-transparent outline-none text-fg placeholder:text-subtle text-base"
                    />
                    <button class="font-mono text-[10px] text-subtle px-1.5 py-0.5 rounded border hairline bg-base" @click=${() => this.closeModal()}>ESC</button>
                  </div>
                  <div class="max-h-[50vh] overflow-y-auto">
                    ${this._renderResults()}
                  </div>
                </div>
              </div>
            </div>
          `
        : nothing}
    `;
  }

  private _renderResults() {
    if (!this.query.trim()) {
      return html`<div class="p-6 text-center text-sm text-subtle">输入关键词搜索文章标题与内容，按 Enter 查看全部结果</div>`;
    }
    if (this.loading) {
      return html`<div class="p-6 text-center text-sm text-subtle">搜索中...</div>`;
    }
    if (this.results.length === 0) {
      return html`<div class="p-6 text-center text-sm text-subtle">没有匹配的文章</div>`;
    }
    return this.results.map(
      (p) => html`
        <button
          class="hover-bg-scale w-full flex items-start gap-3 px-5 py-3.5 border-b hairline last:border-0 text-left cursor-pointer group"
          @click=${() => this._goToPost(p.slug)}
        >
          <span class="text-subtle mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110">${icons.search(15)}</span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-medium text-fg truncate">${p.title}</span>
            <span class="block text-xs text-subtle truncate font-mono mt-0.5">${p.date}</span>
          </span>
        </button>
      `
    );
  }
}
