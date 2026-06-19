/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uga: {
          bg: '#FDFBF7',
          forest: '#1B4332',
          forestLight: '#2D5A46',
          sage: '#E2ECE9',
          sageDark: '#D1E2DD',
          sageLight: '#F3F7F6',
          warmOffWhite: '#F5F2EA',
          accent: '#D95D39', // warm red-orange accent for emergency/crisis breakout buttons
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
