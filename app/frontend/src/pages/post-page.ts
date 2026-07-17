import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getPost } from '../api';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import { formatDate } from '../utils/time';
import type { Post } from '../types';

// 文章详情页 — 标题 + 元信息 + Markdown 正文 + 评论区
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
          <div class="card p-8 animate-pulse">
            <div class="h-8 bg-line rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-line rounded w-1/4 mb-8"></div>
            <div class="h-4 bg-line rounded w-full mb-3"></div>
            <div class="h-4 bg-line rounded w-full mb-3"></div>
            <div class="h-4 bg-line rounded w-2/3"></div>
          </div>
        </div>
      `;
    }

    if (this.error || !this.post) {
      return html`
        <div class="page-enter text-center py-20">
          <p class="text-muted text-lg mb-4">${this.error || '文章不存在'}</p>
          <button class="btn-ghost px-4 py-2 rounded-xl text-sm text-fg cursor-pointer" @click=${() => navigate('/')}>
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
          class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg mb-8 link-underline cursor-pointer"
          @click=${() => navigate('/')}
        >
          ${icons.arrowLeft(14)}
          <span>Back</span>
        </a>

        <article>
          <header class="mb-10 pb-8 border-b border-line">
            <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight mb-4">
              ${p.title}
            </h1>
            <div class="flex flex-wrap items-center gap-3 text-sm text-muted">
              <span class="flex items-center gap-1.5">
                ${icons.clock(14)}
                <time>${formatDate(p.date)}</time>
              </span>
              <span class="text-line">·</span>
              <div class="flex gap-2">
                ${p.tags.map(
                  (t) => html`<tag-badge .name=${t}></tag-badge>`
                )}
              </div>
            </div>
          </header>

          <markdown-viewer .content=${p.content || ''}></markdown-viewer>

          <hr class="border-line my-12" />

          <section class="mt-12">
            <comment-section .slug=${p.slug}></comment-section>
          </section>
        </article>
      </div>
    `;
  }
}
