import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: '#f7f6f0',
          100: '#eceade',
          200: '#d8d5ba',
          300: '#bfb98e',
          400: '#a69b6a',
          500: '#8a7f52',
          600: '#6b6340',
          700: '#514a31',
          800: '#3a3523',
          900: '#2a2618',
          950: '#1a170f',
        },
        cream: {
          50: '#fdfcf7',
          100: '#faf8ef',
          200: '#f5f0dc',
          300: '#ede5c4',
          400: '#e0d4a3',
          500: '#c9b878',
          600: '#b09a53',
          700: '#8f7c3f',
          800: '#6e5f30',
          900: '#4d4222',
        },
        forest: {
          50: '#f0f4e8',
          100: '#dfe8cc',
          200: '#c0d29c',
          300: '#9ab86a',
          400: '#7a9e48',
          500: '#5d7b35',
          600: '#486128',
          700: '#374a1f',
          800: '#283617',
          900: '#1c2610',
        },
        gold: {
          50: '#fefbee',
          100: '#fdf5d4',
          200: '#fae8a4',
          300: '#f7d96e',
          400: '#f2c43a',
          500: '#e6a817',
          600: '#c88510',
          700: '#a66311',
          800: '#874e15',
          900: '#704017',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'olive-gradient': 'linear-gradient(135deg, #374a1f 0%, #486128 100%)',
        'cream-gradient': 'linear-gradient(180deg, #fdfcf7 0%, #faf8ef 100%)',
        'hero-gradient': 'linear-gradient(90deg, rgba(26,23,15,0.85) 0%, rgba(42,38,24,0.6) 50%, rgba(42,38,24,0.2) 100%)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
