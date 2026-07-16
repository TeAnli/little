import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { navigate } from '../router/router';

@customElement('tag-badge')
class TagBadge extends LitElement {
  @property({ type: String }) name = '';
  @property({ type: Number }) count?: number;

  createRenderRoot() {
    return this;
  }

  private _go() {
    navigate(`/tag/${encodeURIComponent(this.name)}`);
  }

  render() {
    return html`
      <button
        class="badge px-3 py-0.5 inline-flex items-center gap-1.5"
        @click=${this._go}
      >
        <span class="font-medium">${this.name}</span>
        ${this.count != null ? html`<span class="opacity-60">${this.count}</span>` : nothing}
      </button>
    `;
  }
}
