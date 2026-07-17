import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getTags } from '../api';
import { navigate } from '../router/router';
import type { Tag } from '../types';

// 标签页 — 标签云，按文章数排序，大小按计数缩放
@customElement('tags-page')
class TagsPage extends LitElement {
  @state() tags: Tag[] = [];
  @state() loading = true;

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this._load();
  }

  private async _load() {
    this.loading = true;
    try {
      this.tags = await getTags();
    } catch {
      this.tags = [];
    } finally {
      this.loading = false;
    }
  }

  private _goTag(name: string) {
    navigate(`/tag/${encodeURIComponent(name)}`);
  }

  render() {
    return html`
      <div class="page-enter">
        <div class="mb-12">
          <p class="text-xs font-medium text-muted uppercase tracking-widest mb-3">Tags</p>
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight">所有标签</h1>
          <p class="text-muted mt-3 text-lg">按文章数量排序，点击筛选相关文章</p>
        </div>

        ${this.loading
          ? html`<div class="flex flex-wrap gap-3 animate-pulse">
              ${Array.from({ length: 8 }).map(
                () => html`<div class="h-9 bg-line rounded-full" style="width: ${80 + Math.random() * 60}px"></div>`
              )}
            </div>`
          : this.tags.length === 0
            ? html`<div class="card p-12 text-center text-muted">还没有标签</div>`
            : html`<div class="flex flex-wrap gap-3 items-center">
                ${this.tags.map((t) => {
                  const max = this.tags[0]?.count || 1;
                  const fontSize = (0.875 + (t.count / max) * 0.75).toFixed(3);
                  return html`
                    <button
                      class="tag-cloud-item badge inline-flex items-center gap-1.5 px-4 py-2 cursor-pointer"
                      style="font-size: ${fontSize}rem"
                      @click=${() => this._goTag(t.name)}
                    >
                      <span class="font-medium">${t.name}</span>
                      <span class="text-xs opacity-60">${t.count}</span>
                    </button>
                  `;
                })}
              </div>`}
      </div>
    `;
  }
}
