import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getPost } from '../api';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';
import { formatDate } from '../utils/time';
import type { TocItem } from '../components/markdown-viewer';
import type { Post } from '../types';

gsap.registerPlugin(ScrollTrigger);

function readTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `~${mins} min read`;
}

@customElement('post-page')
class PostPage extends LitElement {
  @property({ type: String }) slug = '';
  @state() post: Post | null = null;
  @state() loading = true;
  @state() error = '';
  @state() tocItems: TocItem[] = [];
  @state() activeHeadingId = '';
  private scrollFrame = 0;
  private motionContext?: gsap.Context;

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('scroll', this._onScroll, { passive: true });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('scroll', this._onScroll);
    if (this.scrollFrame) cancelAnimationFrame(this.scrollFrame);
    this.motionContext?.revert();
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('slug') && this.slug) {
      this._load();
    }
  }

  private async _load() {
    this.loading = true;
    this.error = '';
    this.tocItems = [];
    this.activeHeadingId = '';
    try {
      this.post = await getPost(this.slug);
    } catch (e) {
      console.error('Failed to load post:', e);
      this.error = '文章加载失败';
      this.post = null;
    } finally {
      this.loading = false;
    }
  }

  private _onTocChange = (e: CustomEvent<TocItem[]>) => {
    this.tocItems = e.detail;
    requestAnimationFrame(() => {
      this._syncActiveHeading();
      this._setupArticleMotion();
    });
  };

  private _setupArticleMotion() {
    this.motionContext?.revert();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const article = this.querySelector<HTMLElement>('.post-article');
    const bg = this.querySelector<HTMLElement>('.post-reading-bg');
    if (!article || !bg) return;

    if (reducedMotion) {
      gsap.set(bg, { opacity: 0.55, scale: 1 });
      return;
    }

    this.motionContext = gsap.context(() => {
      gsap.fromTo(bg,
        { scale: 0.92, opacity: 0.28, y: -18 },
        {
          scale: 1.12,
          opacity: 0.62,
          y: 48,
          ease: 'none',
          scrollTrigger: {
            trigger: article,
            start: 'top 72%',
            end: 'bottom 20%',
            scrub: 0.8,
          },
        },
      );
    }, this);
  }

  private _onScroll = () => {
    if (this.scrollFrame) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0;
      this._syncActiveHeading();
    });
  };

  private _syncActiveHeading() {
    if (this.tocItems.length === 0) return;
    const marker = window.scrollY + 120;
    let active = this.tocItems[0].id;

    for (const item of this.tocItems) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      if (el.offsetTop <= marker) active = item.id;
    }

    if (active !== this.activeHeadingId) {
      this.activeHeadingId = active;
    }
  }

  private _scrollToHeading(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private _tocIndex(id: string) {
    return this.tocItems.findIndex((item) => item.id === id);
  }

  private _renderToc(compact = false) {
    if (this.tocItems.length === 0) return nothing;
    const activeIndex = Math.max(0, this._tocIndex(this.activeHeadingId));
    return html`
      <nav class="toc-track ${compact ? '' : 'max-h-[calc(100dvh-8rem)] overflow-y-auto pr-2'}" aria-label="文章目录">
        ${this.tocItems.map((item, index) => html`
          <button
            class="toc-item ${item.level === 3 ? 'toc-sub' : ''} ${item.id === this.activeHeadingId ? 'is-active' : ''} ${index < activeIndex ? 'is-passed' : ''}"
            @click=${() => this._scrollToHeading(item.id)}
          >
            <span class="truncate">${item.text}</span>
          </button>
        `)}
      </nav>
    `;
  }

  render() {
    if (this.loading) {
      return html`
        <div class="page-enter">
          <div class="py-8">
            <div class="shimmer h-3 rounded w-24 mb-5"></div>
            <div class="shimmer h-9 rounded w-3/4 mb-4"></div>
            <div class="shimmer h-4 rounded w-1/3 mb-10"></div>
            <div class="shimmer h-4 rounded w-full mb-3"></div>
            <div class="shimmer h-4 rounded w-full mb-3"></div>
            <div class="shimmer h-4 rounded w-2/3"></div>
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
      <div class="page-enter page-wide">
        <a
          href="#/"
          class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg mb-10 transition-colors cursor-pointer group"
          @click=${() => navigate('/')}
        >
          <span class="transition-transform duration-300 group-hover:-translate-x-0.5">${icons.arrowLeft(14)}</span>
          <span>Back</span>
        </a>

        <div class="relative grid grid-cols-1 lg:grid-cols-[minmax(0,48rem)_14rem] gap-12 lg:gap-16 items-start">
          <div class="post-reading-bg" aria-hidden="true"></div>
          <article class="post-article relative z-10 min-w-0">
            <header class="mb-10 md:mb-12">
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
                      <div class="flex flex-wrap gap-2">
                        ${p.tags.map((tag) => html`<tag-badge .name=${tag}></tag-badge>`)}
                      </div>`
                  : nothing}
              </div>
            </header>

            ${this.tocItems.length > 0
              ? html`
                  <details class="lg:hidden mb-10 rounded-[var(--radius-box)] border hairline bg-surface px-4 py-3">
                    <summary class="cursor-pointer text-sm font-medium text-fg">目录</summary>
                    <div class="mt-4">${this._renderToc(true)}</div>
                  </details>
                `
              : nothing}

            <markdown-viewer .content=${p.content || ''} @toc-change=${this._onTocChange}></markdown-viewer>

            <hr class="hairline my-14" />

            <section class="mt-14">
              <comment-section .slug=${p.slug}></comment-section>
            </section>
          </article>

          ${this.tocItems.length > 0
            ? html`
                <aside class="hidden lg:block sticky top-24">
                  <p class="text-xs text-subtle mb-4 font-mono">目录</p>
                  ${this._renderToc()}
                </aside>
              `
            : nothing}
        </div>
      </div>
    `;
  }
}
