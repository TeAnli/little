import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { icons } from '../utils/icons';
import type { CommentPayload } from '../types';

// 评论/回复表单 — HeroUI 风格表单 + 内联校验
@customElement('comment-form')
class CommentForm extends LitElement {
  username = '';
  email = '';
  content = '';
  @property({ type: Number }) parentId: number | null = null;
  @property({ type: String }) replyTo = '';
  @state() submitting = false;
  @state() error = '';

  createRenderRoot() {
    return this;
  }

  private _update(field: 'username' | 'email' | 'content', e: InputEvent) {
    this[field] = (e.target as HTMLInputElement | HTMLTextAreaElement).value;
  }

  private _validate(): boolean {
    if (!this.username.trim()) {
      this.error = '请输入用户名';
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.error = '请输入有效的邮箱地址';
      return false;
    }
    if (!this.content.trim()) {
      this.error = '请输入评论内容';
      return false;
    }
    if (this.content.length > 1000) {
      this.error = '评论内容不能超过 1000 字符';
      return false;
    }
    this.error = '';
    return true;
  }

  private async _submit() {
    if (!this._validate()) return;
    this.submitting = true;
    const payload: CommentPayload = {
      parent_id: this.parentId,
      username: this.username.trim(),
      email: this.email.trim(),
      content: this.content.trim(),
    };
    this.dispatchEvent(
      new CustomEvent('submit', { detail: payload, bubbles: true, composed: true })
    );
    this.content = '';
    this.submitting = false;
    const ta = this.querySelector('textarea') as HTMLTextAreaElement | null;
    if (ta) ta.value = '';
  }

  render() {
    return html`
      ${this.replyTo
        ? html`<p class="text-xs text-muted mb-2">回复 @${this.replyTo}</p>`
        : nothing}
      <div class="card p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="用户名 *"
            .value=${this.username}
            @input=${(e: InputEvent) => this._update('username', e)}
            class="input-field px-4 py-2.5 text-sm"
          />
          <input
            type="email"
            placeholder="邮箱 *"
            .value=${this.email}
            @input=${(e: InputEvent) => this._update('email', e)}
            class="input-field px-4 py-2.5 text-sm"
          />
        </div>
        <textarea
          placeholder="写下你的评论..."
          rows="3"
          .value=${this.content}
          @input=${(e: InputEvent) => this._update('content', e)}
          class="input-field px-4 py-2.5 text-sm mb-3 resize-none"
        ></textarea>
        ${this.error
          ? html`<p class="text-sm text-red-500 mb-3" role="alert">${this.error}</p>`
          : nothing}
        <div class="flex justify-end">
          <button
            class="btn-primary px-5 py-2.5 text-sm font-medium inline-flex items-center gap-1.5"
            ?disabled=${this.submitting}
            @click=${this._submit}
          >
            ${icons.send(16)}
            <span>${this.submitting ? '发送中...' : '发表评论'}</span>
          </button>
        </div>
      </div>
    `;
  }
}
