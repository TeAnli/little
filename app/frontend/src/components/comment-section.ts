import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getComments, postComment } from '../api';
import type { Comment, CommentPayload } from '../types';

// 评论列表容器 — 加载评论 + 发表评论
@customElement('comment-section')
class CommentSection extends LitElement {
  @property({ type: String }) slug = '';
  @state() comments: Comment[] = [];
  @state() loading = true;
  @state() error = '';

  createRenderRoot() {
    return this;
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('slug') && this.slug) {
      this._loadComments();
    }
  }

  private async _loadComments() {
    this.loading = true;
    this.error = '';
    try {
      this.comments = await getComments(this.slug);
    } catch (e) {
      this.error = '评论加载失败';
    } finally {
      this.loading = false;
    }
  }

  private async _onSubmit(e: CustomEvent<CommentPayload>) {
    const payload = e.detail;
    try {
      const newComment = await postComment(this.slug, payload);
      if (payload.parent_id != null) {
        this.comments = this.comments.map((c) =>
          c.id === payload.parent_id
            ? { ...c, replies: [...c.replies, newComment] }
            : c
        );
      } else {
        this.comments = [...this.comments, newComment];
      }
      this.requestUpdate();
    } catch (err) {
      this.error = '发表评论失败，请重试';
    }
  }

  get totalCount() {
    let count = this.comments.length;
    this.comments.forEach((c) => (count += c.replies.length));
    return count;
  }

  render() {
    return html`
      <h2 class="font-serif text-2xl font-semibold text-fg mb-6">
        Comments
        <span class="text-muted text-base font-sans font-normal">(${this.totalCount})</span>
      </h2>

      <comment-form
        @submit=${this._onSubmit}
      ></comment-form>

      <div class="mt-8 flex flex-col gap-4">
        ${this.loading
          ? Array.from({ length: 3 }).map(() => html`
              <div class="card p-5 animate-pulse">
                <div class="h-4 bg-line rounded w-1/4 mb-3"></div>
                <div class="h-4 bg-line rounded w-full mb-2"></div>
                <div class="h-4 bg-line rounded w-2/3"></div>
              </div>
            `)
          : this.comments.length === 0
            ? html`<div class="card p-8 text-center text-muted text-sm">还没有评论，来发表第一条吧</div>`
            : this.comments.map((c) => html`<comment-item .comment=${c}></comment-item>`)}
      </div>

      ${this.error
        ? html`<p class="text-sm text-red-500 mt-4" role="alert">${this.error}</p>`
        : nothing}
    `;
  }
}
