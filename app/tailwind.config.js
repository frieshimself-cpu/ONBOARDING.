/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--surface-2) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        text: 'rgb(var(--text) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          2: 'rgb(var(--brand-2) / <alpha-value>)',
        },
        flare: 'rgb(var(--flare) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Unbounded', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        volt: '0 0 0 1px rgb(var(--brand) / 0.25), 0 8px 40px -8px rgb(var(--brand) / 0.35)',
        card: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 10px 32px -16px rgb(0 0 0 / 0.7)',
        pass: '0 1px 0 0 rgb(255 255 255 / 0.05) inset, 0 24px 48px -24px rgb(0 0 0 / 0.8)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        'dash-flow': {
          to: { strokeDashoffset: '-24' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        blink: 'blink 1.1s step-end infinite',
        'dash-flow': 'dash-flow 1.2s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'spin-slow': 'spin-slow 24s linear infinite',
      },
    },
  },
  plugins: [],
}
