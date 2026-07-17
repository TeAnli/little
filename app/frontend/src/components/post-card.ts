import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import { formatDate } from '../utils/time';
import type { Post } from '../types';

// 文章卡片 — HeroUI 无边框 + Magic UI 弹性 hover + stagger 入场
@customElement('post-card')
class PostCard extends LitElement {
  @property({ type: Object }) post?: Post;
  @property({ type: Number }) index = 0;

  createRenderRoot() {
    return this;
  }

  private _go() {
    if (this.post) navigate(`/post/${this.post.slug}`);
  }

  private _onTagClick(e: Event, tag: string) {
    e.stopPropagation();
    navigate(`/tag/${encodeURIComponent(tag)}`);
  }

  render() {
    if (!this.post) return nothing;
    const p = this.post;
    return html`
      <article
        class="card card-hover p-6 cursor-pointer stagger-item"
        style="animation-delay: ${this.index * 60}ms"
        @click=${this._go}
        role="link"
        tabindex="0"
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter') this._go();
        }}
      >
        <h2 class="font-serif text-xl md:text-2xl font-semibold text-fg mb-2 leading-snug">
          ${p.title}
        </h2>
        <div class="flex items-center gap-2 text-sm text-muted mb-3">
          ${icons.clock(13)}
          <time>${formatDate(p.date)}</time>
        </div>
        <p class="text-muted text-base leading-relaxed mb-4">${p.summary}</p>
        <div class="flex flex-wrap gap-2">
          ${p.tags.map(
            (t) => html`
              <span
                class="badge px-3 py-0.5"
                @click=${(e: Event) => this._onTagClick(e, t)}
              >${t}</span>
            `
          )}
        </div>
      </article>
    `;
  }
}
