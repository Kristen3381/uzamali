/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          bg: '#0B251D',
          card: '#13382E',
          accent: '#E5A93B',
          secondary: '#226351',
          text: '#FFFFFF',
          muted: '#A3B8B0',
          border: '#1F5243',
        },
        primary: {
          DEFAULT: '#E5A93B',
          dark: '#0B251D',
          card: '#13382E',
          light: '#226351',
        },
        accent: {
          DEFAULT: '#E5A93B',
          dark: '#c9922f',
        },
        highlight: '#E5A93B',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

