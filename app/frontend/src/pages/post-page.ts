import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';


@customElement('post-page')
class PostPage extends LitElement {
  @state()
  private loading: boolean = true;

  render() {
    return html`<div>文章页面</div>`;
  }
}
