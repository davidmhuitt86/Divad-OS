/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0d0f14',
          800: '#13161e',
          700: '#1a1e28',
          600: '#222736',
          500: '#2a3042',
        },
        accent: {
          blue:   '#3b82f6',
          green:  '#22c55e',
          amber:  '#f59e0b',
          red:    '#ef4444',
          purple: '#a855f7',
          cyan:   '#06b6d4',
        },
        text: {
          primary:   '#e2e8f0',
          secondary: '#94a3b8',
          muted:     '#475569',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
