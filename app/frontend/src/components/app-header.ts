import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { navigate, parseHash } from '../router/router';
import { isLoggedIn } from '../services/auth';
import { icons } from '../utils/icons';

// 导航栏 — 克制毛玻璃 + 下划线式激活态 + 移动端 Drawer
@customElement('app-header')
class AppHeader extends LitElement {
  @state() drawerOpen = false;
  @state() currentPath = '/';

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateActive();
    window.addEventListener('hashchange', () => this._updateActive());
  }

  private _updateActive() {
    const route = parseHash();
    this.currentPath = route.page === 'home' ? '/' : route.page === 'tags' ? '/tags' : '';
  }

  private _closeDrawer() {
    this.drawerOpen = false;
  }

  private _isActive(path: string) {
    return this.currentPath === path;
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
            <nav class="hidden md:flex items-center gap-7">
              <a
                href="#/"
                class="nav-link text-sm font-medium ${this._isActive('/') ? 'active text-fg' : 'text-muted hover:text-fg'}"
                @click=${() => navigate('/')}
              >Home</a>
              <a
                href="#/tags"
                class="nav-link text-sm font-medium ${this._isActive('/tags') ? 'active text-fg' : 'text-muted hover:text-fg'}"
                @click=${() => navigate('/tags')}
              >Tags</a>
              ${isLoggedIn()
                ? html`<a
                    href="#/admin"
                    class="nav-link text-sm font-medium text-muted hover:text-fg"
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
                class="btn-ghost p-2 rounded-[var(--radius-btn)] text-fg cursor-pointer md:hidden"
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
                    class="btn-ghost p-2 rounded-lg text-muted hover:text-fg cursor-pointer"
                    @click=${this._closeDrawer}
                    aria-label="关闭菜单"
                  >
                    ${icons.close(20)}
                  </button>
                </div>
                <nav class="flex flex-col gap-1">
                  <a href="#/" class="btn-ghost px-4 py-3 rounded-[var(--radius-btn)] text-fg font-medium ${this._isActive('/') ? '' : 'text-muted'}" @click=${this._closeDrawer}>Home</a>
                  <a href="#/tags" class="btn-ghost px-4 py-3 rounded-[var(--radius-btn)] font-medium ${this._isActive('/tags') ? 'text-fg' : 'text-muted'}" @click=${this._closeDrawer}>Tags</a>
                  ${isLoggedIn() ? html`<a href="#/admin" class="btn-ghost px-4 py-3 rounded-[var(--radius-btn)] font-medium text-muted" @click=${this._closeDrawer}>Admin</a>` : nothing}
                </nav>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}
