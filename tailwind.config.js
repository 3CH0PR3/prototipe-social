export default {
  darkMode: 'class',

  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],

  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
      },
      maxWidth: {
        '8xl': '88rem', // 1408px
        '9xl': '96rem', // 1536px
        '10xl': '104rem' // 1664px
      },

      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif']
      },

      colors: {
        brand: {
          50: 'rgb(var(--color-brand-50) / <alpha-value>)',
          100: 'rgb(var(--color-brand-100) / <alpha-value>)',
          200: 'rgb(var(--color-brand-200) / <alpha-value>)',
          300: 'rgb(var(--color-brand-300) / <alpha-value>)',
          400: 'rgb(var(--color-brand-400) / <alpha-value>)',
          500: 'rgb(var(--color-brand) / <alpha-value>)',
          600: 'rgb(var(--color-brand-hover) / <alpha-value>)',
          700: 'rgb(var(--color-brand-700) / <alpha-value>)',
          800: 'rgb(var(--color-brand-800) / <alpha-value>)',
          900: 'rgb(var(--color-brand-900) / <alpha-value>)',
          950: 'rgb(var(--color-brand-950) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-brand) / <alpha-value>)'
        },

        accent: {
          500: 'rgb(var(--color-accent) / <alpha-value>)',
          600: 'rgb(var(--color-accent-hover) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)'
        },

        background: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-alt': 'rgb(var(--color-surface-alt) / <alpha-value>)',

        text: {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)'
        },

        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          strong: 'rgb(var(--color-border-strong) / <alpha-value>)'
        },

        // Colores base del sistema para light y dark mode
        base: {
          light: 'rgb(248 250 252)', // slate-50
          dark: 'rgb(2 6 23)'         // slate-950
        }
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)',
        'card-lg': '0 10px 40px -10px rgb(15 23 42 / 0.12)',
        brand: '0 0 30px rgba(99,102,241,.25)',
        accent: '0 0 40px rgba(124,58,237,.18)'
      },

      animation: {
        float: 'float 5s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'fade-up': 'fadeUp .7s ease forwards',
        'gradient-shift': 'gradient-shift 4s linear infinite',
        'pulse-glow': 'pulseGlow 8s ease-in-out infinite',
        'play-ring': 'playRing 2.5s ease-out infinite',
        'play-attention': 'playAttention 2.5s ease-in-out infinite'
      },

      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' }
        },

        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },

        'gradient-shift': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' }
        },

        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },

        pulseGlow: {
          '0%,100%': {
            transform: 'scale(1)',
            opacity: '0.8'
          },
          '50%': {
            transform: 'scale(1.15)',
            opacity: '1'
          }
        },

        playRing: {
          '0%': {
            transform: 'scale(1)',
            opacity: '.6'
          },
          '100%': {
            transform: 'scale(2.5)',
            opacity: '0'
          }
        },

        playAttention: {
          '0%,100%': {
            transform: 'scale(1)'
          },
          '15%': {
            transform: 'scale(1.08)'
          },
          '30%': {
            transform: 'scale(1)'
          },
          '45%': {
            transform: 'scale(1.12)'
          },
          '60%': {
            transform: 'scale(1)'
          }
        }
      }
    }
  },

  plugins: [require('@tailwindcss/forms')]
};
