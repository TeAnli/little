import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { icons } from '../utils/icons';
import { timeAgo } from '../utils/time';
import type { Comment } from '../types';

// 单条评论 — 含嵌套回复
@customElement('comment-item')
class CommentItem extends LitElement {
  @property({ type: Object }) comment?: Comment;

  createRenderRoot() {
    return this;
  }

  private _reply() {
    if (!this.comment) return;
    this.dispatchEvent(
      new CustomEvent('reply', {
        detail: { parentId: this.comment.id, username: this.comment.username },
        bubbles: true,
        composed: true,
      })
    );
  }

  render() {
    if (!this.comment) return nothing;
    const c = this.comment;
    return html`
      <div class="card p-5">
        <div class="flex items-center gap-2 mb-2">
          <div
            class="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium shrink-0"
            style="color: rgb(var(--c-base))"
          >
            ${c.username[0]?.toUpperCase()}
          </div>
          <span class="font-medium text-sm text-fg">${c.username}</span>
          <span class="text-xs text-muted">${timeAgo(c.created_at)}</span>
        </div>
        <p class="text-sm text-fg leading-relaxed mb-2">${c.content}</p>
        <button
          class="text-xs text-muted hover:text-fg link-underline cursor-pointer inline-flex items-center gap-1"
          @click=${this._reply}
        >
          ${icons.reply(14)}
          <span>Reply</span>
        </button>
        ${c.replies.length > 0
          ? html`
              <div class="mt-4 flex flex-col gap-4">
                ${c.replies.map(
                  (r) => html`
                    <div class="comment-nested">
                      <div class="flex items-center gap-2 mb-1.5">
                        <div
                          class="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-medium shrink-0"
                          style="color: rgb(var(--c-base))"
                        >
                          ${r.username[0]?.toUpperCase()}
                        </div>
                        <span class="font-medium text-sm text-fg">${r.username}</span>
                        <span class="text-xs text-muted">${timeAgo(r.created_at)}</span>
                      </div>
                      <p class="text-sm text-muted leading-relaxed">${r.content}</p>
                    </div>
                  `
                )}
              </div>
            `
          : nothing}
      </div>
    `;
  }
}
