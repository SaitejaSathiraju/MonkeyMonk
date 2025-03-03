/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors:{
        primary: {
          50: "#fef9eb",
          100: "#fdf0d2",
          200: "#fde49c",
          300: "#fcc96a",
          400: "#fcb814",
          500: "#d49a00",
          600: "#ad7e00",
          700: "#876200",
          800: "#5f4500",
          900: "#392900",
        },
        'color-primary':'#FCB814',
        'color-primary-bg':'#1f1d1d',
        'color-secondary-bg':'#3f3c3c',
        'color-text-primary':'#ddd9d9',
        'color-text-secondary':'#adadad',
      },
    },
  },
  plugins: [],
}

