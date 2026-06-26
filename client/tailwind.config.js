/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B6B3C',
          light: '#E8F5E9',
        },
        accent: '#2ECC71',
        highlight: '#F1C40F',
      },
    },
  },
  plugins: [],
}
