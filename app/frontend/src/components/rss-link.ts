import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { icons } from '../utils/icons';

@customElement('rss-link')
class RssLink extends LitElement {
  @property({ type: String }) href = '/api/rss';

  createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <a
        href=${this.href}
        class="micro-lift inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors group"
        aria-label="RSS 订阅"
      >
        <span class="transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">${icons.rss(14)}</span>
        <span>RSS</span>
      </a>
    `;
  }
}
