import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { marked } from 'marked';

marked.setOptions({
  breaks: false,
  gfm: true,
});

@customElement('markdown-viewer')
class MarkdownViewer extends LitElement {
  @property({ type: String }) content = '';

  createRenderRoot() {
    return this;
  }

  render() {
    if (!this.content) return nothing;
    const htmlContent = marked.parse(this.content) as string;
    return html`<div class="prose-blog" .innerHTML=${htmlContent}></div>`;
  }
}
