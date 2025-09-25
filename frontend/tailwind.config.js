/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'crypto-dark': '#0B0E11',
        'crypto-card': '#161B22',
        'crypto-border': '#30363D',
        'crypto-green': '#00D4AA',
        'crypto-red': '#FF4747',
        'crypto-blue': '#3B82F6',
        'crypto-yellow': '#F59E0B',
      },
      animation: {
        'pulse-green': 'pulse-green 0.5s ease-in-out',
        'pulse-red': 'pulse-red 0.5s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-green': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#00D4AA20' },
        },
        'pulse-red': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: '#FF474720' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}