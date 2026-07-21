import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getPost } from '../api';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import { formatDate } from '../utils/time';
import type { Post } from '../types';

function readTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `~${mins} min read`;
}

// 文章详情页 — 精炼头部 + Markdown 正文 + 评论区
@customElement('post-page')
class PostPage extends LitElement {
  @property({ type: String }) slug = '';
  @state() post: Post | null = null;
  @state() loading = true;
  @state() error = '';

  createRenderRoot() {
    return this;
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('slug') && this.slug) {
      this._load();
    }
  }

  private async _load() {
    this.loading = true;
    this.error = '';
    try {
      this.post = await getPost(this.slug);
    } catch (e) {
      this.error = '文章加载失败';
      this.post = null;
    } finally {
      this.loading = false;
    }
  }

  render() {
    if (this.loading) {
      return html`
        <div class="page-enter">
          <div class="py-8 animate-pulse">
            <div class="h-3 bg-hairline rounded w-24 mb-5"></div>
            <div class="h-9 bg-hairline rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-hairline rounded w-1/3 mb-10"></div>
            <div class="h-4 bg-hairline rounded w-full mb-3"></div>
            <div class="h-4 bg-hairline rounded w-full mb-3"></div>
            <div class="h-4 bg-hairline rounded w-2/3"></div>
          </div>
        </div>
      `;
    }

    if (this.error || !this.post) {
      return html`
        <div class="page-enter text-center py-24">
          <p class="text-muted text-base mb-4">${this.error || '文章不存在'}</p>
          <button class="btn-ghost px-4 py-2 rounded-[var(--radius-btn)] text-sm text-fg cursor-pointer" @click=${() => navigate('/')}>
            返回首页
          </button>
        </div>
      `;
    }

    const p = this.post;
    return html`
      <div class="page-enter">
        <a
          href="#/"
          class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg mb-10 transition-colors cursor-pointer"
          @click=${() => navigate('/')}
        >
          ${icons.arrowLeft(14)}
          <span>Back</span>
        </a>

        <article>
          <header class="mb-12">
            <h1 class="font-serif text-3xl md:text-[2.5rem] md:leading-[1.15] font-bold text-fg mb-5">
              ${p.title}
            </h1>
            <div class="flex flex-wrap items-center gap-3 text-sm text-subtle">
              <span class="flex items-center gap-1.5">
                ${icons.clock(13)}
                <time class="font-mono text-xs">${formatDate(p.date)}</time>
              </span>
              <span>·</span>
              <span class="text-subtle text-xs">${readTime(p.content || '')}</span>
              ${p.tags.length > 0
                ? html`<span>·</span>
                    <div class="flex gap-2">
                      ${p.tags.map((t) => html`<tag-badge .name=${t}></tag-badge>`)}
                    </div>`
                : nothing}
            </div>
          </header>

          <markdown-viewer .content=${p.content || ''}></markdown-viewer>

          <hr class="hairline my-14" />

          <section class="mt-14">
            <comment-section .slug=${p.slug}></comment-section>
          </section>
        </article>
      </div>
    `;
  }
}
