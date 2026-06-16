/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        sans: ['Exo 2', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cyan: { 400: '#00d4ff' },
        purple: { 600: '#7c3aed' },
      },
    },
  },
  plugins: [],
}
