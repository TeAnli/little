import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getTheme, toggleTheme, watchSystemTheme, type Theme } from '../utils/theme';
import { icons } from '../utils/icons';

@customElement('theme-switcher')
class ThemeSwitcher extends LitElement {
  @state() current: Theme = 'light';

  createRenderRoot() { return this; }

  connectedCallback() {
    super.connectedCallback();
    this.current = getTheme();
    watchSystemTheme((t) => { this.current = t; });
  }

  private _toggle(e: Event) {
    const btn = e.currentTarget as HTMLElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const root = document.documentElement;
    root.style.setProperty('--theme-toggle-x', `${x}px`);
    root.style.setProperty('--theme-toggle-y', `${y}px`);
    root.style.setProperty('--theme-toggle-r', `${maxR}px`);

    const doc = document as unknown as {
      startViewTransition?: (cb: () => void) => void;
    };

    if (reducedMotion || !doc.startViewTransition) {
      this.current = toggleTheme();
      return;
    }

    doc.startViewTransition(() => {
      this.current = toggleTheme();
    });
  }

  render() {
    return html`
      <button
        class="btn-ghost p-2 rounded-[var(--radius-btn)] text-muted hover:text-fg cursor-pointer"
        @click=${this._toggle}
        aria-label=${this.current === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
      >
        ${this.current === 'dark' ? icons.sun(18) : icons.moon(18)}
      </button>
    `;
  }
}
