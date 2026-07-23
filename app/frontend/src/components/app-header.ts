import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import gsap from 'gsap';
import { navigate, parseHash } from '../router/router';
import { isLoggedIn } from '../services/auth';
import { icons } from '../utils/icons';
import { siteConfig } from '../config/site';

interface NavItem {
  label: string;
  path: string;
  href: string;
  auth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/', href: '#/' },
  { label: 'Tags', path: '/tags', href: '#/tags' },
  { label: 'Admin', path: '/admin', href: '#/admin', auth: true },
];

@customElement('app-header')
class AppHeader extends LitElement {
  @state() drawerOpen = false;
  @state() currentPath = '/';

  private readonly reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  private resizeTimer?: number;

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateActive();
    window.addEventListener('hashchange', this._updateActive);
    window.addEventListener('resize', this._onResize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('hashchange', this._updateActive);
    window.removeEventListener('resize', this._onResize);
    if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
  }

  firstUpdated() {
    this._restoreActiveNav(true);
  }

  private _visibleItems() {
    return NAV_ITEMS.filter((item) => !item.auth || isLoggedIn());
  }

  private _activePathFromRoute() {
    const route = parseHash();
    if (route.page === 'home') return '/';
    if (route.page === 'tags' || route.page === 'tag') return '/tags';
    if (route.page === 'admin' || route.page === 'editor') return '/admin';
    return '';
  }

  private _updateActive = () => {
    this.currentPath = this._activePathFromRoute();
    requestAnimationFrame(() => this._restoreActiveNav(true));
  };

  private _onResize = () => {
    if (this.resizeTimer) window.clearTimeout(this.resizeTimer);
    this.resizeTimer = window.setTimeout(() => this._restoreActiveNav(true), 120);
  };

  private _closeDrawer = () => {
    this.drawerOpen = false;
  };

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
      scaleX: 1,
      scaleY: 1,
      duration: immediate || this.reducedMotion.matches ? 0 : 0.34,
      ease: 'power3.out',
      overwrite: true,
    };

    if (immediate || this.reducedMotion.matches) {
      gsap.set(bg, vars);
    } else {
      gsap.fromTo(bg, { scaleX: 0.5, scaleY: 0.96 }, vars);
    }

    this._navLinks().forEach((link) => {
      gsap.to(link, {
        y: link === target ? -1 : 0,
        scale: link === target ? 1.012 : 1,
        duration: this.reducedMotion.matches ? 0 : 0.2,
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
        scaleX: 0.5,
        scaleY: 0.96,
        duration: immediate || this.reducedMotion.matches ? 0 : 0.2,
        ease: 'power2.out',
        overwrite: true,
      });
    }

    this._navLinks().forEach((link) => gsap.to(link, {
      y: 0,
      scale: 1,
      duration: this.reducedMotion.matches ? 0 : 0.16,
      overwrite: true,
    }));
  }

  private _navigate(path: string) {
    navigate(path);
    this._closeDrawer();
  }

  private _renderDesktopNav() {
    return html`
      <nav
        class="nav-pill-wrap hidden md:flex items-center gap-1 relative p-1"
        aria-label="主导航"
        @mouseleave=${() => this._restoreActiveNav()}
      >
        <span class="nav-hover-bg" aria-hidden="true"></span>
        ${this._visibleItems().map((item) => html`
          <a
            href=${item.href}
            data-path=${item.path}
            class="nav-link nav-pill-link relative z-10 px-3 py-2 text-sm font-medium ${this._isActive(item.path) ? 'active text-fg' : 'text-muted hover:text-fg'}"
            @mouseenter=${(event: MouseEvent) => this._moveNavBg(event.currentTarget as HTMLElement)}
            @focus=${(event: FocusEvent) => this._moveNavBg(event.currentTarget as HTMLElement)}
            @click=${() => navigate(item.path)}
          >${item.label}</a>
        `)}
      </nav>
    `;
  }

  private _renderDrawer() {
    if (!this.drawerOpen) return nothing;

    return html`
      <div
        class="fixed inset-0 z-50 md:hidden"
        @click=${(event: Event) => {
          if (event.target === event.currentTarget) this._closeDrawer();
        }}
      >
        <div class="drawer-overlay overlay-enter absolute inset-0"></div>
        <aside class="mobile-drawer modal-enter">
          <div class="flex items-center justify-between mb-8">
            <a
              href="#/"
              class="brand-mark"
              @click=${() => this._navigate('/')}
            >
              ${siteConfig.title}
            </a>
            <button
              class="btn-ghost micro-lift p-2 text-muted hover:text-fg cursor-pointer"
              @click=${this._closeDrawer}
              aria-label="关闭菜单"
            >
              ${icons.close(20)}
            </button>
          </div>

          <nav class="mobile-nav-list" aria-label="移动端导航">
            ${this._visibleItems().map((item) => html`
              <a
                href=${item.href}
                class="mobile-nav-item ${this._isActive(item.path) ? 'is-active' : ''}"
                @click=${() => this._navigate(item.path)}
              >
                <span>${item.label}</span>
                <span>${icons.arrowRight(15)}</span>
              </a>
            `)}
          </nav>
        </aside>
      </div>
    `;
  }

  render() {
    return html`
      <header class="site-header sticky top-0 z-40">
        <div class="header-shell">
          <a
            href="#/"
            class="brand-mark"
            @click=${() => navigate('/')}
            aria-label="回到首页"
          >
            ${siteConfig.title}
          </a>

          ${this._renderDesktopNav()}

          <div class="header-actions">
            <search-bar></search-bar>
            <theme-switcher></theme-switcher>
            <button
              class="btn-ghost micro-lift p-2 text-fg cursor-pointer md:hidden"
              @click=${() => (this.drawerOpen = true)}
              aria-label="打开菜单"
              aria-expanded=${this.drawerOpen}
            >
              ${icons.menu(20)}
            </button>
          </div>
        </div>
      </header>

      ${this._renderDrawer()}
    `;
  }
}
