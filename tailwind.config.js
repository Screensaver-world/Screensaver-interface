// https://tailwindcss.com/docs/theme
// const colors = require('tailwindcss/colors')

// https://smart-swatch.netlify.app/#303030 - gray (use gray.50 from figma)
// https://smart-swatch.netlify.app/#FF3434 - red

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      mono: ['IBM Plex Mono', 'monospace'],
      serif: ['ui-serif', 'Georgia'],
    },
    extend: {
      boxShadow: {
        white: '0px 0px 4px ',
        sm: '1px 2px #A78BFA',
        DEFAULT:
          '0 1px 3px 0 rgba(255, 0, 0, 0.1), 0 1px 2px 0 rgba(255, 0, 0, 0.06)',
        md:
          '0 4px 6px -1px rgba(255, 0, 0, 0.1), 0 2px 4px -1px rgba(255, 0, 0, 0.06)',
        lg: '3px 4px #A78BFA',
        xl:
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(255, 0, 0, 0.25)',
        '3xl': '0 35px 60px -15px rgba(255, 0, 0, 0.3)',
        inner: 'inset 0 2px 4px 0 rgba(255, 0, 0, 0.06)',
        none: 'none',
      },
      keyframes: {
        roll: {
          '0%, 100%': { transform: 'translateX(0) rotate(10deg)' },
          '50%': { transform: 'translateX(100vw) rotate(385deg)' },
        },
      },
      animation: {
        roll: 'roll 60s ease-in-out infinite',
      },
      colors: {
        gray: {
          50: '#f9f9f9',
          100: '#d9d9d9',
          200: '#bfbfbf',
          300: '#a6a6a6',
          400: '#8c8c8c',
          500: '#737373',
          600: '#595959',
          700: '#404040',
          750: '#111111',
          800: '#262626',
          900: '#120b0d',
        },
        red: {
          50: '#FF472D',
          100: '#A78BFA',
          200: '#A78BFA',
          300: '#A78BFA',
          400: '#A78BFA',
          500: '#A78BFA',
          600: '#A78BFA',
          700: '#A78BFA',
          800: '#A78BFA',
          900: '#A78BFA',
        },
      },
    },
  }
}
