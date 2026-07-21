import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { login } from '../services/auth';
import { navigate } from '../router/router';

@customElement('login-page')
class LoginPage extends LitElement {
  @state() error = '';
  @state() loading = false;

  createRenderRoot() { return this; }

  private async _submit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const pw = new FormData(form).get('password') as string;
    this.loading = true;
    this.error = '';
    try {
      const ok = await login(pw);
      if (ok) {
        navigate('/admin');
      } else {
        this.error = '密码错误';
      }
    } catch {
      this.error = '登录失败，请检查后端是否启动';
    }
    this.loading = false;
  }

  render() {
    return html`
      <div class="max-w-sm mx-auto pt-12 md:pt-20 page-enter">
        <h1 class="font-serif text-2xl font-bold text-fg mb-8 text-center">管理登录</h1>
        <form class="card p-6" @submit=${this._submit}>
          <input
            type="password" name="password" placeholder="管理员密码"
            class="input-field px-4 py-3 text-sm mb-4" required autofocus
          />
          ${this.error ? html`<p class="text-red-500 text-sm mb-4">${this.error}</p>` : ''}
          <button
            type="submit" ?disabled=${this.loading}
            class="btn-primary w-full py-3 text-sm text-white dark:text-black"
          >${this.loading ? '...' : '登录'}</button>
        </form>
      </div>
    `;
  }
}
