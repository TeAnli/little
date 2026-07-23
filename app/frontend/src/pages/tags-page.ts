import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getTags } from '../api';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import type { Tag } from '../types';

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
    } catch (error) {
      console.error('Failed to load tags:', error);
      this.tags = [];
    } finally {
      this.loading = false;
    }
  }

  private _goTag(name: string) {
    navigate(`/tag/${encodeURIComponent(name)}`);
  }

  private get totalPosts() {
    return this.tags.reduce((sum, tag) => sum + tag.count, 0);
  }

  private _renderLoading() {
    return html`
      <div class="tag-list">
        ${Array.from({ length: 6 }).map(() => html`
          <div class="tag-row">
            <div class="min-w-0 flex-1">
              <div class="shimmer h-5 rounded w-32 mb-3"></div>
              <div class="shimmer h-2 rounded w-full"></div>
            </div>
            <div class="shimmer h-8 rounded-[6px] w-16"></div>
          </div>
        `)}
      </div>
    `;
  }

  render() {
    const max = this.tags[0]?.count || 1;

    return html`
      <div class="page-enter">
        <section class="tags-hero">
          <p class="home-kicker">Tags</p>
          <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight">所有标签</h1>
          <div class="tags-summary">
            <span>${this.tags.length} 个标签</span>
            <span>${this.totalPosts} 次归档</span>
          </div>
        </section>

        ${this.loading
        ? this._renderLoading()
        : this.tags.length === 0
          ? html`<div class="py-20 text-center"><p class="text-muted text-base">还没有标签</p></div>`
          : html`
                <div class="tag-list">
                  ${this.tags.map((tag, index) => {
            const percent = Math.max(8, Math.round((tag.count / max) * 100));
            return html`
                      <button class="tag-row" type="button" @click=${() => this._goTag(tag.name)}>
                        <span class="tag-index">${String(index + 1).padStart(2, '0')}</span>
                        <span class="tag-main">
                          <span class="tag-title">
                            <span>${tag.name}</span>
                            ${index === 0 ? html`<span class="tag-featured">最多阅读</span>` : nothing}
                          </span>
                          <span class="tag-meter" aria-hidden="true">
                            <span style="width: ${percent}%"></span>
                          </span>
                        </span>
                        <span class="tag-count">
                          <strong>${tag.count}</strong>
                          <span>篇</span>
                        </span>
                        <span class="tag-arrow">${icons.arrowRight(15)}</span>
                      </button>
                    `;
          })}
                </div>
              `}
      </div>
    `;
  }
}
