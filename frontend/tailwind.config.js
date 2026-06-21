/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        'ink-soft': 'var(--ink-soft)',
        muted: 'var(--muted)',
        navy: 'var(--navy)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        teal: 'var(--teal)',
        green: 'var(--green)',
        red: 'var(--red)',
        amber: 'var(--amber)',
      },
      fontFamily: {
        head: 'var(--head-font)',
        body: "'Literata', Georgia, serif",
        mono: "'JetBrains Mono', monospace",
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
