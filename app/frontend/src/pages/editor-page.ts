import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getPost, createPost, updatePost } from '../api';
import { isLoggedIn, verifyToken } from '../services/auth';
import { navigate } from '../router/router';

@customElement('editor-page')
class EditorPage extends LitElement {
  @property({ type: String }) slug = '';
  @state() title = '';
  @state() tags = '';
  @state() summary = '';
  @state() content = '';
  @state() date = '';
  @state() saving = false;
  @state() error = '';
  @state() preview = false;
  private _loaded = false;

  createRenderRoot() { return this; }

  async connectedCallback() {
    super.connectedCallback();
    if (!isLoggedIn() || !(await verifyToken())) { navigate('/login'); return; }
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('slug') && this.slug && !this._loaded) {
      this._loaded = true;
      this._load();
    }
  }

  private async _load() {
    try {
      const p = await getPost(this.slug);
      this.title = p.title; this.tags = p.tags.join(', ');
      this.summary = p.summary; this.content = p.content || ''; this.date = p.date;
    } catch { this.error = '文章加载失败'; }
  }

  private async _submit(e: Event) {
    e.preventDefault();
    this.saving = true; this.error = '';
    try {
      const tagList = this.tags.split(',').map(t => t.trim()).filter(Boolean);
      const payload = { title: this.title, content: this.content, tags: tagList, summary: this.summary, date: this.date };
      if (this.slug) { await updatePost(this.slug, payload); }
      else { await createPost(payload); }
      navigate('/admin');
    } catch (err: any) { this.error = err.message || '保存失败'; }
    this.saving = false;
  }

  render() {
    return html`
      <div class="page-enter">
        <a href="#/admin" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg mb-8 transition-colors cursor-pointer"
          @click=${() => navigate('/admin')}>← 返回后台</a>

        <div class="flex items-center justify-between mb-8">
          <h1 class="font-serif text-2xl font-bold text-fg">${this.slug ? '编辑文章' : '写文章'}</h1>
          <button class="btn-ghost px-3 py-1.5 text-xs text-muted"
            @click=${() => this.preview = !this.preview}>
            ${this.preview ? '编辑' : '预览'}
          </button>
        </div>

        ${this.preview
          ? html`<div class="card p-6 md:p-8"><markdown-viewer .content=${this.content}></markdown-viewer></div>`
          : html`
            <form class="flex flex-col gap-4" @submit=${this._submit}>
              <div>
                <label class="block text-xs font-medium text-muted mb-2">标题</label>
                <input class="input-field px-3.5 py-2.5 text-sm" placeholder="文章标题" .value=${this.title}
                  @input=${(e: InputEvent) => this.title = (e.target as HTMLInputElement).value} required>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-muted mb-2">标签（逗号分隔）</label>
                  <input class="input-field px-3.5 py-2.5 text-sm" placeholder="frontend, lit" .value=${this.tags}
                    @input=${(e: InputEvent) => this.tags = (e.target as HTMLInputElement).value}>
                </div>
                <div>
                  <label class="block text-xs font-medium text-muted mb-2">摘要</label>
                  <input class="input-field px-3.5 py-2.5 text-sm" placeholder="一句话摘要" .value=${this.summary}
                    @input=${(e: InputEvent) => this.summary = (e.target as HTMLInputElement).value}>
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-muted mb-2">正文（Markdown）</label>
                <textarea class="input-field px-3.5 py-2.5 text-sm font-mono" rows="20" placeholder="# 标题..." .value=${this.content}
                  @input=${(e: InputEvent) => this.content = (e.target as HTMLTextAreaElement).value} required></textarea>
              </div>
              ${this.error ? html`<p class="text-red-500 text-sm">${this.error}</p>` : ''}
              <button type="submit" ?disabled=${this.saving}
                class="btn-primary py-2.5 text-sm self-start px-6">
                ${this.saving ? '保存中...' : this.slug ? '更新' : '发布'}
              </button>
            </form>`}
      </div>
    `;
  }
}
