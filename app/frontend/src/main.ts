// 应用入口 — 导入全局样式，注册根组件，挂载到 #app
import './global.css';
import './app';

const mount = document.getElementById('app');
if (mount) {
  const app = document.createElement('blog-app');
  mount.appendChild(app);
}
