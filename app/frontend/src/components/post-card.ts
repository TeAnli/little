import { LitElement, html, nothing } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property } from 'lit/decorators.js';
import { navigate } from '../router/router';
import { formatDate } from '../utils/time';
import type { Post } from '../types';

// 文章列表项 — 编辑式，无卡片背景，靠排版与分隔线
@customElement('post-card')
class PostCard extends LitElement {
  @property({ type: Object }) post?: Post;
  @property({ type: Number }) index = 0;
  @property({ type: String }) highlight = '';

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
        class="list-item stagger-item py-7"
        style="animation-delay: ${Math.min(this.index * 50, 300)}ms"
        @click=${this._go}
        role="link"
        tabindex="0"
        @keydown=${(e: KeyboardEvent) => {
          if (e.key === 'Enter') this._go();
        }}
      >
        <!-- 元信息行：日期 + 标签 -->
        <div class="flex items-center gap-3 mb-2.5">
          <time class="text-xs text-subtle font-mono tracking-tight">${formatDate(p.date)}</time>
          ${p.tags.length > 0
            ? html`<span class="text-subtle text-xs">·</span>
                <span class="text-xs text-muted">${p.tags.join(' / ')}</span>`
            : nothing}
        </div>

        <!-- 标题 — hover 下划线展开 -->
        <h2 class="list-title font-serif text-xl md:text-2xl font-bold text-fg leading-snug mb-2 link-underline inline transition-opacity duration-300">
          ${p.title}
        </h2>

        <!-- 摘要 -->
        <p class="list-summary text-muted text-[0.95rem] leading-relaxed line-clamp-2 transition-colors duration-300">${highlightText(p.summary, this.highlight)}</p>
      </article>
    `;
  }
}

function highlightText(text: string, q: string) {
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(re);
  return unsafeHTML(parts.map(p =>
    re.test(p) ? `<mark class="bg-yellow-200 dark:bg-yellow-800/60 rounded px-0.5">${p}</mark>`
    : p.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  ).join(''));
}
