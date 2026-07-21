import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getTheme, toggleTheme, watchSystemTheme, type Theme } from '../utils/theme';
import { icons } from '../utils/icons';

@customElement('theme-switcher')
class ThemeSwitcher extends LitElement {
  @state() current: Theme = 'light';

  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.current = getTheme();
    watchSystemTheme((t) => {
      this.current = t;
    });
  }

  private _toggle() {
    this.current = toggleTheme();
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
