import { LitElement, html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { icons } from '../utils/icons';
import { timeAgo } from '../utils/time';
import type { Comment } from '../types';

// 单条评论 — 无卡片背景，靠分隔线分组，含嵌套回复
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
      <div>
        <div class="flex items-center gap-2.5 mb-2">
          <div
            class="w-7 h-7 rounded-full bg-[rgb(var(--c-fg)/0.06)] flex items-center justify-center text-xs font-semibold shrink-0 text-fg"
          >
            ${c.username[0]?.toUpperCase()}
          </div>
          <span class="font-medium text-sm text-fg">${c.username}</span>
          <span class="text-xs text-subtle font-mono">${timeAgo(c.created_at)}</span>
        </div>
        <p class="text-sm text-fg leading-relaxed mb-2 pl-9">${c.content}</p>
        <button
          class="text-xs text-subtle hover:text-fg transition-colors cursor-pointer inline-flex items-center gap-1 ml-9"
          @click=${this._reply}
        >
          ${icons.reply(13)}
          <span>回复</span>
        </button>
        ${c.replies.length > 0
          ? html`
              <div class="mt-4 flex flex-col gap-4">
                ${c.replies.map(
                  (r) => html`
                    <div class="comment-nested">
                      <div class="flex items-center gap-2 mb-1.5">
                        <div
                          class="w-5 h-5 rounded-full bg-[rgb(var(--c-fg)/0.06)] flex items-center justify-center text-[10px] font-semibold shrink-0 text-fg"
                        >
                          ${r.username[0]?.toUpperCase()}
                        </div>
                        <span class="font-medium text-sm text-fg">${r.username}</span>
                        <span class="text-xs text-subtle font-mono">${timeAgo(r.created_at)}</span>
                      </div>
                      <p class="text-sm text-muted leading-relaxed pl-7">${r.content}</p>
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
