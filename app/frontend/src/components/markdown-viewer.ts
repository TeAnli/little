import { LitElement, html, nothing } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { marked, Renderer } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import katex from 'katex';
import 'highlight.js/styles/github.min.css';
import 'katex/dist/katex.min.css';

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

const renderer = new Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : undefined;
  const highlighted = language
    ? hljs.highlight(text, { language }).value
    : hljs.highlightAuto(text).value;
  return `<div class="code-block-wrapper">
    <span class="code-lang">${language || ''}</span>
    <button class="code-copy" data-code="${encodeURIComponent(text)}">复制</button>
    <pre><code class="hljs language-${language || ''}">${highlighted}</code></pre>
  </div>`;
};

const mathExtension = {
  name: 'math',
  level: 'block' as const,
  start(src: string) { return src.indexOf('$$'); },
  tokenizer(src: string) {
    const match = src.match(/^\$\$\n?([\s\S]*?)\n?\$\$/);
    if (match) {
      return { type: 'math', raw: match[0], text: match[1].trim() };
    }
    return undefined;
  },
  renderer(token: any) {
    try {
      return `<div class="math-block">${katex.renderToString(token.text, { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return token.raw;
    }
  },
};

const inlineMathExtension = {
  name: 'inlineMath',
  level: 'inline' as const,
  start(src: string) { return src.indexOf('$'); },
  tokenizer(src: string) {
    const match = src.match(/^\$([^$\n]+?)\$/);
    if (match) return { type: 'inlineMath', raw: match[0], text: match[1].trim() };
    return undefined;
  },
  renderer(token: any) {
    try {
      return katex.renderToString(token.text, { throwOnError: false });
    } catch {
      return token.raw;
    }
  },
};

marked.use({ extensions: [mathExtension, inlineMathExtension] });
marked.setOptions({ breaks: false, gfm: true, renderer });

function slugifyHeading(text: string, used: Map<string, number>) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'section';
  const count = used.get(base) || 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

@customElement('markdown-viewer')
class MarkdownViewer extends LitElement {
  @property({ type: String }) content = '';
  @query('.prose-blog') container!: HTMLDivElement;

  createRenderRoot() { return this; }

  updated(changed: Map<string, unknown>) {
    if (changed.has('content')) {
      this._hydrateHeadings();
      this._bindCodeCopyButtons();
    }
  }

  private _hydrateHeadings() {
    if (!this.container) return;
    const used = new Map<string, number>();
    const items: TocItem[] = [];

    this.container.querySelectorAll<HTMLHeadingElement>('h2, h3').forEach((heading) => {
      heading.querySelector('.heading-anchor')?.remove();
      const text = heading.textContent?.trim() || '';
      if (!text) return;

      const id = heading.id || slugifyHeading(text, used);
      heading.id = id;
      items.push({ id, text, level: heading.tagName === 'H2' ? 2 : 3 });

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'heading-anchor';
      button.setAttribute('aria-label', `定位到 ${text}`);
      button.textContent = '#';
      button.addEventListener('click', () => {
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      heading.appendChild(button);
    });

    this.dispatchEvent(new CustomEvent<TocItem[]>('toc-change', {
      detail: items,
      bubbles: true,
      composed: true,
    }));
  }

  private _bindCodeCopyButtons() {
    this.container?.querySelectorAll('.code-copy').forEach(btn => {
      if (btn.hasAttribute('data-listener')) return;
      btn.setAttribute('data-listener', '1');
      btn.addEventListener('click', () => {
        const code = decodeURIComponent((btn as HTMLElement).dataset.code || '');
        navigator.clipboard.writeText(code).then(() => {
          btn.textContent = '已复制';
          setTimeout(() => (btn.textContent = '复制'), 1500);
        });
      });
    });
  }

  render() {
    if (!this.content) return nothing;
    const raw = marked.parse(this.content) as string;
    const clean = DOMPurify.sanitize(raw, {
      ALLOWED_ATTR: [
        'href',
        'src',
        'alt',
        'class',
        'data-code',
        'id',
        'target',
        'colspan',
        'rowspan',
        'style',
        'width',
        'height',
        'scope',
        'align',
        'aria-label',
      ],
    });
    return html`<div class="prose-blog" .innerHTML=${clean}></div>`;
  }
}
