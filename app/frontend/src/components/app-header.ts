import { LitElement, html, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { navigate, parseHash } from '../router/router';
import { icons } from '../utils/icons';

// 导航栏 — 毛玻璃 + HeroUI 无边框 + 移动端 Drawer
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
        class="frosted sticky top-0 z-40 border-b"
        style="border-color: rgb(var(--c-border) / 0.5)"
      >
        <div class="max-w-3xl mx-auto px-4 md:px-6">
          <div class="flex items-center justify-between h-16">
            <!-- Logo -->
            <a
              href="#/"
              class="font-serif text-xl font-bold text-fg tracking-tight flex items-center gap-2 cursor-pointer"
              @click=${() => navigate('/')}
            >
              <span class="inline-block w-2 h-2 rounded-full bg-accent"></span>
              Little Blog
            </a>

            <!-- 桌面导航 -->
            <nav class="hidden md:flex items-center gap-1">
              <a
                href="#/"
                class="btn-ghost px-3 py-2 text-sm font-medium rounded-lg ${this._isActive('/') ? 'text-fg' : 'text-muted'}"
              >Home</a>
              <a
                href="#/tags"
                class="btn-ghost px-3 py-2 text-sm font-medium rounded-lg ${this._isActive('/tags') ? 'text-fg' : 'text-muted'}"
              >Tags</a>
            </nav>

            <!-- 右侧操作区 -->
            <div class="flex items-center gap-2">
              <search-bar></search-bar>
              <theme-switcher></theme-switcher>
              <!-- 移动端菜单 -->
              <button
                class="btn-ghost p-2.5 rounded-xl text-fg cursor-pointer md:hidden"
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
              <div class="drawer-overlay absolute inset-0"></div>
              <div class="absolute right-0 top-0 h-full w-72 bg-surface p-6 modal-enter" style="box-shadow: var(--shadow-lg)">
                <div class="flex items-center justify-between mb-8">
                  <span class="font-serif text-lg font-bold text-fg">Menu</span>
                  <button
                    class="btn-ghost p-2 rounded-lg text-muted hover:text-fg cursor-pointer"
                    @click=${this._closeDrawer}
                    aria-label="关闭菜单"
                  >
                    ${icons.close(20)}
                  </button>
                </div>
                <nav class="flex flex-col gap-1">
                  <a
                    href="#/"
                    class="btn-ghost px-4 py-3 rounded-xl text-fg font-medium ${this._isActive('/') ? '' : 'text-muted'}"
                    @click=${this._closeDrawer}
                  >Home</a>
                  <a
                    href="#/tags"
                    class="btn-ghost px-4 py-3 rounded-xl font-medium ${this._isActive('/tags') ? 'text-fg' : 'text-muted'}"
                    @click=${this._closeDrawer}
                  >Tags</a>
                </nav>
              </div>
            </div>
          `
        : nothing}
    `;
  }
}
