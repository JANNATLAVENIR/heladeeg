/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf9f6',
          100: '#f3f0e9',
          200: '#e6e0d3',
          300: '#d4c8b0',
          400: '#beaa82',
          500: '#a28c64',
          600: '#272522',
          700: '#1c1b19',
          800: '#151412',
          900: '#100f0e',
          950: '#080807',
        },
        accent: {
          50: '#faf7f0',
          100: '#eee6d5',
          200: '#dfd0ae',
          300: '#cdb783',
          400: '#b69b61',
          500: '#9f8148',
          600: '#82683c',
          700: '#675232',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
