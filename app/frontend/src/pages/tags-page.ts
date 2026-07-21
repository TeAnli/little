import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getTags } from '../api';
import { navigate } from '../router/router';
import type { Tag } from '../types';

// 标签页 — 精炼标签云，按文章数排序
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
        <div class="mb-14">
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight">所有标签</h1>
          <p class="text-muted mt-3 text-base md:text-lg">按文章数量排序，点击筛选相关文章</p>
        </div>

        ${this.loading
          ? html`<div class="flex flex-wrap gap-2.5 animate-pulse">
              ${Array.from({ length: 8 }).map(
                () => html`<div class="h-8 bg-hairline rounded-full" style="width: ${70 + Math.random() * 60}px"></div>`
              )}
            </div>`
          : this.tags.length === 0
            ? html`<div class="py-20 text-center"><p class="text-muted text-base">还没有标签</p></div>`
            : html`<div class="flex flex-wrap gap-2.5 items-center">
                ${this.tags.map((t) => {
                  const max = this.tags[0]?.count || 1;
                  const fontSize = (0.875 + (t.count / max) * 0.5).toFixed(3);
                  return html`
                    <button
                      class="tag-cloud-item badge inline-flex items-center gap-1.5 px-3.5 py-1.5 cursor-pointer"
                      style="font-size: ${fontSize}rem"
                      @click=${() => this._goTag(t.name)}
                    >
                      <span class="font-medium">${t.name}</span>
                      <span class="text-xs opacity-50">${t.count}</span>
                    </button>
                  `;
                })}
              </div>`}
      </div>
    `;
  }
}
