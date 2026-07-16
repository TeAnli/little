export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'little-blog-theme';

/**
 * 读取系统当前的配色偏好
 * @returns {Theme} 系统偏好主题（'dark' 或 'light'）
 */
function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * 获取当前应使用的主题。
 * 优先使用 localStorage 中保存的用户选择，若无则回退到系统偏好。
 * @returns {Theme} 当前主题
 */
export function getTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return saved || getSystemTheme();
  } catch {
    // localStorage 不可用时回退到系统偏好
    return getSystemTheme();
  }
}

/**
 * 应用指定主题到页面根元素（<html>）并持久化到 localStorage。
 * 该操作会覆盖系统偏好，变为用户手动选择。
 * @param {Theme} theme - 要应用的主题
 */
export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // localStorage 不可用时静默失败（仍会应用主题到 DOM）
  }
}

/**
 * 在亮/暗主题之间切换。
 * 切换后会自动调用 setTheme 进行应用和持久化。
 * @returns {Theme} 切换后的新主题
 */
export function toggleTheme(): Theme {
  const current = getTheme();
  const next: Theme = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

/**
 * 初始化主题：
 * 1. 将当前主题（由 getTheme 决定）应用到 DOM。
 * 2. 监听系统主题变化，但仅在用户未手动设置过主题时自动跟随。
 *
 * 注意：该函数不会写入 localStorage，因此不会将“跟随系统”锁定为手动选择。
 */
export function initTheme(): void {
  // 仅应用到 DOM，不写入 localStorage，避免把"跟随系统"变成手动锁定
  document.documentElement.setAttribute('data-theme', getTheme());
  watchSystemTheme((theme) => {
    document.documentElement.setAttribute('data-theme', theme);
  });
}

/**
 * 监听系统主题变化。
 * 当系统偏好改变时，如果用户未曾手动设置过主题（即 localStorage 中无记录），
 * 则会调用回调函数并传入新的系统主题。
 *
 * @param {(theme: Theme) => void} callback - 系统主题变化时的回调函数，参数为新主题
 */
export function watchSystemTheme(callback: (theme: Theme) => void): void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', (e) => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        callback(e.matches ? 'dark' : 'light');
      }
    } catch {
      // localStorage 不可用时，视为无手动设置，直接跟随系统
      callback(e.matches ? 'dark' : 'light');
    }
  });
}