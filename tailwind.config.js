/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        bifrost: {
          bg: '#0b0f1a',
          panel: '#111827',
          border: '#1f2937',
          ice: '#67e8f9',
          violet: '#a78bfa',
          ok: '#4ade80',
          warn: '#facc15',
          danger: '#f87171'
        }
      }
    }
  },
  plugins: []
};
