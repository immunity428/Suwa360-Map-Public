/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#0a0a14',
        surface: '#1a1a2e',
        'surface-2': '#1f1f35',
        brand: '#cc1e24',
        'brand-dark': '#9e1219',
        gold: '#e8b84b',
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
