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
          DEFAULT: '#1E5631', // dark forest green
          light: '#D5F5E3',   // light background green
        },
        accent: '#27AE60',    // mid green
        highlight: '#F1C40F', // yellow - for Buy Now and Accept Delivery
      },
    },
  },
  plugins: [],
}
