import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import gsap from 'gsap';
import { navigate, parseHash } from '../router/router';
import { isLoggedIn } from '../services/auth';
import { icons } from '../utils/icons';

// 导航栏 — 克制毛玻璃 + 下划线式激活态 + 移动端 Drawer
@customElement('app-header')
class AppHeader extends LitElement {
  @state() drawerOpen = false;
  @state() currentPath = '/';
  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateActive();
    window.addEventListener('hashchange', () => this._updateActive());
  }

  firstUpdated() {
    this._restoreActiveNav(true);
  }

  private _updateActive() {
    const route = parseHash();
    this.currentPath = route.page === 'home' ? '/' : route.page === 'tags' ? '/tags' : route.page === 'admin' ? '/admin' : '';
    requestAnimationFrame(() => this._restoreActiveNav(true));
  }

  private _closeDrawer() {
    this.drawerOpen = false;
  }

  private _isActive(path: string) {
    return this.currentPath === path;
  }

  private _navBg() {
    return this.querySelector<HTMLElement>('.nav-hover-bg');
  }

  private _navWrap() {
    return this.querySelector<HTMLElement>('.nav-pill-wrap');
  }

  private _navLinks() {
    return Array.from(this.querySelectorAll<HTMLElement>('.nav-pill-link'));
  }

  private _moveNavBg(target: HTMLElement, immediate = false) {
    const bg = this._navBg();
    const wrap = this._navWrap();
    if (!bg || !wrap) return;

    const wrapRect = wrap.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const vars = {
      x: targetRect.left - wrapRect.left,
      y: targetRect.top - wrapRect.top,
      width: targetRect.width,
      height: targetRect.height,
      opacity: 1,
      scale: 1,
      duration: immediate || this.reducedMotion.matches ? 0 : 0.42,
      ease: 'power3.out',
      overwrite: true,
    };

    if (!immediate && !this.reducedMotion.matches) {
      gsap.fromTo(bg, { scale: 0.88 }, vars);
    } else {
      gsap.set(bg, vars);
    }

    this._navLinks().forEach((link) => {
      gsap.to(link, {
        scale: link === target ? 1.035 : 1,
        duration: this.reducedMotion.matches ? 0 : 0.22,
        ease: 'power2.out',
        overwrite: true,
      });
    });
  }

  private _restoreActiveNav(immediate = false) {
    const active = this.querySelector<HTMLElement>(`.nav-pill-link[data-path="${this.currentPath}"]`);
    const bg = this._navBg();
    if (active) {
      this._moveNavBg(active, immediate);
      return;
    }
    if (bg) {
      gsap.to(bg, {
        opacity: 0,
        scale: 0.92,
        duration: immediate || this.reducedMotion.matches ? 0 : 0.24,
        ease: 'power2.out',
        overwrite: true,
      });
    }
    this._navLinks().forEach((link) => gsap.to(link, {
      scale: 1,
      duration: this.reducedMotion.matches ? 0 : 0.18,
      overwrite: true,
    }));
  }

  render() {
    return html`
      <header
        class="frosted sticky top-0 z-40 border-b hairline"
      >
        <div class="max-w-3xl mx-auto px-5 md:px-6">
          <div class="flex items-center justify-between h-16">
            <!-- 字标：更克制，无圆点 -->
            <a
              href="#/"
              class="font-serif text-lg font-bold text-fg tracking-tight cursor-pointer transition-opacity hover:opacity-70"
              @click=${() => navigate('/')}
            >
              Little Blog
            </a>

            <!-- 桌面导航 — 下划线激活态 -->
            <nav
              class="nav-pill-wrap hidden md:flex items-center gap-1 relative p-1 rounded-[6px]"
              @mouseleave=${() => this._restoreActiveNav()}
            >
              <span class="nav-hover-bg" aria-hidden="true"></span>
              <a
                href="#/"
                data-path="/"
                class="nav-link nav-pill-link relative z-10 px-3 py-2 rounded-[6px] text-sm font-medium ${this._isActive('/') ? 'active text-fg' : 'text-muted hover:text-fg'}"
                @mouseenter=${(e: MouseEvent) => this._moveNavBg(e.currentTarget as HTMLElement)}
                @focus=${(e: FocusEvent) => this._moveNavBg(e.currentTarget as HTMLElement)}
                @click=${() => navigate('/')}
              >Home</a>
              <a
                href="#/tags"
                data-path="/tags"
                class="nav-link nav-pill-link relative z-10 px-3 py-2 rounded-[6px] text-sm font-medium ${this._isActive('/tags') ? 'active text-fg' : 'text-muted hover:text-fg'}"
                @mouseenter=${(e: MouseEvent) => this._moveNavBg(e.currentTarget as HTMLElement)}
                @focus=${(e: FocusEvent) => this._moveNavBg(e.currentTarget as HTMLElement)}
                @click=${() => navigate('/tags')}
              >Tags</a>
              ${isLoggedIn()
        ? html`<a
                    href="#/admin"
                    data-path="/admin"
                    class="nav-link nav-pill-link relative z-10 px-3 py-2 rounded-[6px] text-sm font-medium ${this._isActive('/admin') ? 'active text-fg' : 'text-muted hover:text-fg'}"
                    @mouseenter=${(e: MouseEvent) => this._moveNavBg(e.currentTarget as HTMLElement)}
                    @focus=${(e: FocusEvent) => this._moveNavBg(e.currentTarget as HTMLElement)}
                    @click=${() => navigate('/admin')}
                  >Admin</a>`
        : nothing}
            </nav>

            <!-- 右侧操作区 -->
            <div class="flex items-center gap-1">
              <search-bar></search-bar>
              <theme-switcher></theme-switcher>
              <!-- 移动端菜单 -->
              <button
                class="btn-ghost micro-lift p-2 rounded-[var(--radius-btn)] text-fg cursor-pointer md:hidden"
                @click=${() => (this.drawerOpen = true)}
                aria-label="打开菜单"
              >
                ${icons.menu(20)}
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- 移动端 Drawer -->
      ${this.drawerOpen
        ? html`
            <div class="fixed inset-0 z-50 md:hidden" @click=${(e: Event) => {
            if (e.target === e.currentTarget) this._closeDrawer();
          }}>
              <div class="drawer-overlay overlay-enter absolute inset-0"></div>
              <div class="absolute right-0 top-0 h-full w-72 bg-surface p-6 modal-enter border-l hairline">
                <div class="flex items-center justify-between mb-10">
                  <span class="font-serif text-base font-bold text-fg">Menu</span>
                  <button
                    class="btn-ghost micro-lift p-2 rounded-lg text-muted hover:text-fg cursor-pointer"
                    @click=${this._closeDrawer}
                    aria-label="关闭菜单"
                  >
                    ${icons.close(20)}
                  </button>
                </div>
                <nav class="flex flex-col gap-1">
                  <a href="#/" class="btn-ghost micro-lift px-4 py-3 rounded-[var(--radius-btn)] text-fg font-medium ${this._isActive('/') ? '' : 'text-muted'}" @click=${this._closeDrawer}>Home</a>
                  <a href="#/tags" class="btn-ghost micro-lift px-4 py-3 rounded-[var(--radius-btn)] font-medium ${this._isActive('/tags') ? 'text-fg' : 'text-muted'}" @click=${this._closeDrawer}>Tags</a>
                  ${isLoggedIn() ? html`<a href="#/admin" class="btn-ghost micro-lift px-4 py-3 rounded-[var(--radius-btn)] font-medium text-muted" @click=${this._closeDrawer}>Admin</a>` : nothing}
                </nav>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}
