module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#082f49',
          light: '#0c4a6e',
          dark: '#082f49',
        }
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
