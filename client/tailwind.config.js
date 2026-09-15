/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#faf9f7',
          100: '#f0ede8',
          200: '#e0d9d0',
          300: '#c8bfb0',
          400: '#a89b8a',
          500: '#8a7d6c',
          600: '#6b6052',
          700: '#524a3f',
          800: '#3a342c',
          900: '#25221d',
          950: '#141210',
        },
        gold: {
          50: '#fdf9ef',
          100: '#f9f0d4',
          200: '#f2dda5',
          300: '#e9c56e',
          400: '#e2af42',
          500: '#d49a2a',
          600: '#b87920',
          700: '#97591d',
          800: '#7c471f',
          900: '#673b1d',
          950: '#3b1e0d',
        },
        parchment: {
          50: '#fdfcf9',
          100: '#f8f5ed',
          200: '#f0e9d8',
          300: '#e5d8bc',
          400: '#d6c19a',
          500: '#c7aa7d',
          600: '#b49065',
          700: '#977452',
          800: '#7c6046',
          900: '#664f3b',
          950: '#36291e',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Anek Bangla Variable"', 'Georgia', 'serif'],
        body: ['"Inter"', '"Anek Bangla Variable"', 'system-ui', 'sans-serif'],
        serif: ['"Libre Baskerville"', '"Anek Bangla Variable"', 'Georgia', 'serif'],
        bangla: ['"Anek Bangla Variable"', '"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '70ch',
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'slide-in': 'slideIn 0.6s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
      },
    },
  },
  plugins: [],
}
