import { html } from 'lit';
import 'iconify-icon';

/**
 * 生成一个 Iconify 图标元素的 Lit 模板
 * @param {string} icon - Iconify 图标名称（如 'mdi:weather-sunny'）
 * @param {number} [size=18] - 图标的宽高（像素）
 * @returns {import('lit').TemplateResult} Lit 模板结果
 */
const wrap = (icon: string, size = 18) => html`
  <iconify-icon icon=${icon} width=${size} height=${size}></iconify-icon>
`;

/**
 * 将 Material Design Icons 的简短名称转换为完整的 Iconify 标识符
 * @param {string} name - MDI 图标名称（如 'weather-sunny'）
 * @returns {string} 完整的 Iconify 图标 ID（如 'mdi:weather-sunny'）
 */
const mdi = (name: string) => `mdi:${name}`;

/**
 * 预定义的图标生成器集合
 * 每个属性都是一个函数，接收可选的尺寸参数，返回对应的图标模板
 */
export const icons = {
  sun: (size?: number) => wrap(mdi('weather-sunny'), size),
  moon: (size?: number) => wrap(mdi('weather-night'), size),
  search: (size?: number) => wrap(mdi('magnify'), size),
  tag: (size?: number) => wrap(mdi('tag'), size),
  rss: (size?: number) => wrap(mdi('rss'), size),
  clock: (size?: number) => wrap(mdi('clock-outline'), size),
  reply: (size?: number) => wrap(mdi('reply'), size),
  send: (size?: number) => wrap(mdi('send'), size),
  menu: (size?: number) => wrap(mdi('menu'), size),
  close: (size?: number) => wrap(mdi('close'), size),
  arrowLeft: (size?: number) => wrap(mdi('arrow-left'), size),
  arrowRight: (size?: number) => wrap(mdi('arrow-right'), size),
  caretLeft: (size?: number) => wrap(mdi('chevron-left'), size),
  caretRight: (size?: number) => wrap(mdi('chevron-right'), size),
  arrowUp: (size?: number) => wrap(mdi('arrow-up'), size),
};