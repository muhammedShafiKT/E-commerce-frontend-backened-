/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],

  theme: {
    extend: {
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-40px,0)' }
        },
        floatDiagonal: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(60px,-60px,0)' }
        },
        gradientShift: {
          '0%': { transform: 'translate3d(-10%, -10%, 0) scale(1)' },
          '50%': { transform: 'translate3d(10%, 10%, 0) scale(1.1)' },
          '100%': { transform: 'translate3d(-10%, -10%, 0) scale(1)' }
        },
        pulseOpacity: {
          '0%,100%': { opacity: '0.25' },
          '50%': { opacity: '0.5' }
        }
      },
      animation: {
        floatSlow: 'floatSlow 18s ease-in-out infinite',
        floatDiagonal: 'floatDiagonal 26s ease-in-out infinite',
        gradientShift: 'gradientShift 40s ease-in-out infinite',
        pulseOpacity: 'pulseOpacity 8s ease-in-out infinite'
      }
    }
  },

  extend: {
  keyframes: {
    fadeUp: {
      '0%': {
        opacity: 0,
        transform: 'translateY(40px)'
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)'
      }
    }
  },
  animation: {
    fadeUp: 'fadeUp 1.2s ease forwards'
  }
}

}



