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
    } catch (e) {
      this.error = '登录失败，请检查后端是否启动';
      console.error("登陆失败, 错误原因: ", e);
    }
    this.loading = false;
  }

  render() {
    return html`
      <div class="max-w-sm mx-auto pt-16 md:pt-24 page-enter">
        <h1 class="font-serif text-2xl font-bold text-fg mb-2 text-center">管理登录</h1>
        <p class="text-sm text-subtle text-center mb-8">输入管理员密码以继续</p>
        <form class="card p-6" @submit=${this._submit}>
          <label class="block text-xs font-medium text-muted mb-2">密码</label>
          <input
            type="password" name="password" placeholder="••••••••"
            class="input-field px-3.5 py-2.5 text-sm mb-4" required autofocus
          />
          ${this.error ? html`<p class="text-red-500 text-sm mb-4">${this.error}</p>` : ''}
          <button
            type="submit" ?disabled=${this.loading}
            class="btn-primary w-full py-2.5 text-sm"
          >${this.loading ? '登录中...' : '登录'}</button>
        </form>
      </div>
    `;
  }
}
