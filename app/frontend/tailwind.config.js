/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{ts,js}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans: ['"Noto Sans JP"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      maxWidth: {
        prose: '720px',
      },
      colors: {
        // 语义色板映射到 CSS 变量，支持亮暗模式
        base: 'rgb(var(--c-base) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        fg: 'rgb(var(--c-fg) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        line: 'rgb(var(--c-border) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};
