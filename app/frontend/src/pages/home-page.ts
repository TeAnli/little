import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getPosts } from '../api';
import type { Post } from '../types';

@customElement('home-page')
class HomePage extends LitElement {
  render() {
    return html`<div>首页</div>`;
  }
}
