import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { getPost, createPost, updatePost } from '../api';
import { isLoggedIn, verifyToken } from '../services/auth';
import { navigate } from '../router/router';
import { icons } from '../utils/icons';

type EditorMode = 'edit' | 'split' | 'preview';

interface ToolbarAction {
  label: string;
  title: string;
  icon: TemplateResult;
  run: () => void;
}

interface DraftPayload {
  title?: string;
  tags?: string;
  summary?: string;
  content?: string;
  date?: string;
  savedAt?: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

@customElement('editor-page')
class EditorPage extends LitElement {
  @property({ type: String }) slug = '';
  @state() title = '';
  @state() tags = '';
  @state() summary = '';
  @state() content = '';
  @state() date = today();
  @state() saving = false;
  @state() loading = false;
  @state() error = '';
  @state() mode: EditorMode = 'split';
  @state() draftState = '未保存';
  @query('#markdown-editor') editor?: HTMLTextAreaElement;

  private loadedSlug = '';
  private draftTimer?: number;

  createRenderRoot() { return this; }

  async connectedCallback() {
    super.connectedCallback();
    if (!isLoggedIn() || !(await verifyToken())) {
      navigate('/login');
      return;
    }
    document.addEventListener('keydown', this._onShortcut);
    if (!this.slug) this._loadDraft();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onShortcut);
    if (this.draftTimer) window.clearTimeout(this.draftTimer);
  }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('slug') && this.slug && this.slug !== this.loadedSlug) {
      this.loadedSlug = this.slug;
      this._loadPost();
    }
  }

  private get draftKey() {
    return `little-blog-editor:${this.slug || 'new'}`;
  }

  private get wordCount() {
    const trimmed = this.content.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  private get charCount() {
    return this.content.length;
  }

  private get lineCount() {
    return this.content ? this.content.split('\n').length : 0;
  }

  private get tagList() {
    return this.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  private async _loadPost() {
    this.loading = true;
    this.error = '';
    try {
      const post = await getPost(this.slug);
      this.title = post.title;
      this.tags = post.tags.join(', ');
      this.summary = post.summary;
      this.content = post.content || '';
      this.date = post.date || today();
      this._loadDraft();
    } catch (error) {
      console.error('Failed to load post for editing:', error);
      this.error = '文章加载失败';
    } finally {
      this.loading = false;
    }
  }

  private _loadDraft() {
    const raw = localStorage.getItem(this.draftKey);
    if (!raw) {
      this.draftState = '未保存';
      return;
    }
    try {
      const draft = JSON.parse(raw) as DraftPayload;
      this.title = draft.title ?? this.title;
      this.tags = draft.tags ?? this.tags;
      this.summary = draft.summary ?? this.summary;
      this.content = draft.content ?? this.content;
      this.date = draft.date ?? this.date;
      this.draftState = draft.savedAt ? `已恢复草稿 ${draft.savedAt}` : '已恢复草稿';
    } catch {
      localStorage.removeItem(this.draftKey);
      this.draftState = '草稿不可用';
    }
  }

  private _queueDraftSave() {
    this.draftState = '保存中...';
    if (this.draftTimer) window.clearTimeout(this.draftTimer);
    this.draftTimer = window.setTimeout(() => {
      localStorage.setItem(this.draftKey, JSON.stringify({
        title: this.title,
        tags: this.tags,
        summary: this.summary,
        content: this.content,
        date: this.date,
        savedAt: new Date().toLocaleTimeString(),
      }));
      this.draftState = '草稿已保存';
    }, 450);
  }

  private _updateField(field: 'title' | 'tags' | 'summary' | 'content' | 'date', value: string) {
    this[field] = value;
    this._queueDraftSave();
  }

  private _onShortcut = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (target && !this.contains(target) && !target.closest('editor-page')) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      this._submit();
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      event.preventDefault();
      this._wrapSelection('**', '**', '加粗文本');
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      this._wrapSelection('*', '*', '斜体文本');
    }
  };

  private _focusEditor() {
    requestAnimationFrame(() => this.editor?.focus());
  }

  private _replaceSelection(replacement: string, selectionStartOffset = replacement.length, selectionEndOffset = selectionStartOffset) {
    const textarea = this.editor;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = this.content.slice(0, start);
    const after = this.content.slice(end);
    this.content = `${before}${replacement}${after}`;
    this._queueDraftSave();
    this._focusEditor();

    requestAnimationFrame(() => {
      textarea.setSelectionRange(start + selectionStartOffset, start + selectionEndOffset);
    });
  }

  private _wrapSelection(prefix: string, suffix = prefix, placeholder = '文本') {
    const textarea = this.editor;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = this.content.slice(start, end) || placeholder;
    const replacement = `${prefix}${selected}${suffix}`;
    this._replaceSelection(replacement, prefix.length, prefix.length + selected.length);
  }

  private _prefixLines(prefix: string, placeholder = '列表项') {
    const textarea = this.editor;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = this.content.lastIndexOf('\n', start - 1) + 1;
    const lineEndIndex = this.content.indexOf('\n', end);
    const lineEnd = lineEndIndex === -1 ? this.content.length : lineEndIndex;
    const selected = this.content.slice(lineStart, lineEnd) || placeholder;
    const replacement = selected
      .split('\n')
      .map((line, index) => prefix.includes('{n}')
        ? prefix.replace('{n}', String(index + 1)) + line
        : prefix + line)
      .join('\n');

    this.content = `${this.content.slice(0, lineStart)}${replacement}${this.content.slice(lineEnd)}`;
    this._queueDraftSave();
    this._focusEditor();
    requestAnimationFrame(() => textarea.setSelectionRange(lineStart, lineStart + replacement.length));
  }

  private _insertBlock(block: string, cursorOffset = block.length) {
    const textarea = this.editor;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const needsBreakBefore = start > 0 && this.content[start - 1] !== '\n';
    const needsBreakAfter = this.content[start] && this.content[start] !== '\n';
    const replacement = `${needsBreakBefore ? '\n' : ''}${block}${needsBreakAfter ? '\n' : ''}`;
    const offset = (needsBreakBefore ? 1 : 0) + cursorOffset;
    this._replaceSelection(replacement, offset, offset);
  }

  private _toolbarActions(): ToolbarAction[] {
    return [
      { label: 'H2', title: '二级标题', icon: icons.heading(16), run: () => this._prefixLines('## ', '标题') },
      { label: 'B', title: '加粗 Ctrl+B', icon: icons.bold(16), run: () => this._wrapSelection('**', '**', '加粗文本') },
      { label: 'I', title: '斜体 Ctrl+I', icon: icons.italic(16), run: () => this._wrapSelection('*', '*', '斜体文本') },
      { label: 'Link', title: '链接', icon: icons.link(16), run: () => this._wrapSelection('[', '](https://example.com)', '链接文本') },
      { label: 'Image', title: '图片', icon: icons.image(16), run: () => this._insertBlock('![图片描述](https://example.com/image.png)', 2) },
      { label: 'Quote', title: '引用', icon: icons.quote(16), run: () => this._prefixLines('> ', '引用内容') },
      { label: 'Code', title: '代码块', icon: icons.code(16), run: () => this._insertBlock('```ts\nconsole.log("hello");\n```', 6) },
      { label: 'List', title: '无序列表', icon: icons.bulletList(16), run: () => this._prefixLines('- ', '列表项') },
      { label: 'Ordered', title: '有序列表', icon: icons.orderedList(16), run: () => this._prefixLines('{n}. ', '列表项') },
      { label: 'Table', title: '表格', icon: icons.table(16), run: () => this._insertBlock('| 列 A | 列 B |\n| --- | --- |\n| 内容 | 内容 |') },
      { label: 'Math', title: '数学公式', icon: icons.math(16), run: () => this._insertBlock('$$\nE = mc^2\n$$', 3) },
      { label: 'HR', title: '分割线', icon: icons.horizontalRule(16), run: () => this._insertBlock('---') },
    ];
  }

  private async _submit(event?: Event) {
    event?.preventDefault();
    if (!this.title.trim() || !this.content.trim()) {
      this.error = '标题和正文不能为空';
      return;
    }

    this.saving = true;
    this.error = '';
    try {
      if (this.slug) {
        await updatePost(this.slug, {
          title: this.title.trim(),
          content: this.content,
          tags: this.tagList,
          summary: this.summary.trim(),
          date: this.date || today(),
        });
      } else {
        await createPost({
          title: this.title.trim(),
          content: this.content,
          tags: this.tagList,
          summary: this.summary.trim(),
        });
      }
      localStorage.removeItem(this.draftKey);
      navigate('/admin');
    } catch (error: any) {
      console.error('Failed to save post:', error);
      this.error = error.message || '保存失败';
    } finally {
      this.saving = false;
    }
  }

  private _renderModeButton(mode: EditorMode, label: string, icon: TemplateResult) {
    return html`
      <button
        type="button"
        class="editor-mode-btn ${this.mode === mode ? 'is-active' : ''}"
        @click=${() => (this.mode = mode)}
        aria-pressed=${this.mode === mode}
      >
        ${icon}
        <span>${label}</span>
      </button>
    `;
  }

  private _renderToolbar() {
    return html`
      <div class="editor-toolbar" aria-label="Markdown 工具栏">
        ${this._toolbarActions().map((action) => html`
          <button
            type="button"
            class="editor-tool"
            title=${action.title}
            aria-label=${action.title}
            @click=${action.run}
          >
            ${action.icon}
          </button>
        `)}
      </div>
    `;
  }

  private _renderEditorPane() {
    return html`
      <section class="editor-pane ${this.mode === 'preview' ? 'hidden lg:block' : ''}">
        <div class="editor-pane-head">
          <span>Markdown</span>
          <span class="font-mono">${this.lineCount} lines / ${this.charCount} chars</span>
        </div>
        ${this._renderToolbar()}
        <textarea
          id="markdown-editor"
          class="editor-textarea"
          placeholder="# 标题&#10;&#10;在这里开始写作..."
          .value=${this.content}
          @input=${(event: InputEvent) => this._updateField('content', (event.target as HTMLTextAreaElement).value)}
          required
        ></textarea>
      </section>
    `;
  }

  private _renderPreviewPane() {
    return html`
      <section class="editor-pane ${this.mode === 'edit' ? 'hidden lg:block' : ''}">
        <div class="editor-pane-head">
          <span>Preview</span>
          <span class="font-mono">${this.wordCount} words</span>
        </div>
        <div class="editor-preview">
          ${this.content
            ? html`<markdown-viewer .content=${this.content}></markdown-viewer>`
            : html`<p class="text-sm text-subtle">预览会显示在这里。</p>`}
        </div>
      </section>
    `;
  }

  render() {
    return html`
      <div class="page-enter page-wide">
        <a
          href="#/admin"
          class="micro-lift inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg mb-8 transition-colors cursor-pointer group"
          @click=${() => navigate('/admin')}
        >
          <span class="transition-transform duration-300 group-hover:-translate-x-0.5">${icons.arrowLeft(14)}</span>
          <span>返回后台</span>
        </a>

        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 class="font-serif text-3xl md:text-4xl font-bold text-fg leading-tight">
              ${this.slug ? '编辑文章' : '写文章'}
            </h1>
            <p class="text-sm text-subtle mt-2">${this.draftState} / Ctrl+S 保存 / Ctrl+B、Ctrl+I 格式化</p>
          </div>
          <div class="editor-mode-switch" aria-label="编辑器视图">
            ${this._renderModeButton('edit', '编辑', icons.edit(15))}
            ${this._renderModeButton('split', '分屏', icons.split(15))}
            ${this._renderModeButton('preview', '预览', icons.preview(15))}
          </div>
        </div>

        <form class="editor-shell" @submit=${this._submit}>
          <section class="editor-meta">
            <label class="editor-field md:col-span-2">
              <span>标题</span>
              <input
                class="input-field px-3.5 py-2.5 text-sm"
                placeholder="文章标题"
                .value=${this.title}
                @input=${(event: InputEvent) => this._updateField('title', (event.target as HTMLInputElement).value)}
                required
              />
            </label>
            <label class="editor-field">
              <span>标签</span>
              <input
                class="input-field px-3.5 py-2.5 text-sm"
                placeholder="frontend, lit"
                .value=${this.tags}
                @input=${(event: InputEvent) => this._updateField('tags', (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="editor-field">
              <span>日期</span>
              <input
                type="date"
                class="input-field px-3.5 py-2.5 text-sm"
                .value=${this.date}
                @input=${(event: InputEvent) => this._updateField('date', (event.target as HTMLInputElement).value)}
              />
            </label>
            <label class="editor-field md:col-span-4">
              <span>摘要</span>
              <input
                class="input-field px-3.5 py-2.5 text-sm"
                placeholder="一句话摘要"
                .value=${this.summary}
                @input=${(event: InputEvent) => this._updateField('summary', (event.target as HTMLInputElement).value)}
              />
            </label>
          </section>

          ${this.error ? html`<p class="text-red-500 text-sm" role="alert">${this.error}</p>` : nothing}
          ${this.loading ? html`<div class="shimmer h-64 rounded-[var(--radius-box)]"></div>` : html`
            <div class="editor-grid ${this.mode === 'split' ? 'is-split' : ''}">
              ${this._renderEditorPane()}
              ${this._renderPreviewPane()}
            </div>
          `}

          <div class="editor-footer">
            <div class="flex flex-wrap items-center gap-2 text-xs text-subtle">
              ${this.tagList.map((tag) => html`<span class="badge px-2 py-0.5">${tag}</span>`)}
              ${this.tagList.length === 0 ? html`<span>暂无标签</span>` : nothing}
            </div>
            <button type="submit" ?disabled=${this.saving || this.loading} class="btn-primary micro-lift px-5 py-2.5 text-sm inline-flex items-center gap-2 group">
              <span class="transition-transform duration-300 group-hover:-translate-y-0.5">${icons.save(15)}</span>
              <span>${this.saving ? '保存中...' : this.slug ? '更新文章' : '发布文章'}</span>
            </button>
          </div>
        </form>
      </div>
    `;
  }
}
