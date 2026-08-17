import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAF7F2',
        foreground: '#2C1810',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#2C1810',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#2C1810',
        },
        primary: {
          DEFAULT: '#6F4E37',
          foreground: '#FFFFFF',
          hover: '#5A3E2E',
        },
        secondary: {
          DEFAULT: '#D48B5C',
          foreground: '#FFFFFF',
          hover: '#C47A4A',
        },
        muted: {
          DEFAULT: '#F5E6D3',
          foreground: '#6F4E37',
        },
        accent: {
          DEFAULT: '#D48B5C',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#C75B5B',
          foreground: '#FFFFFF',
        },
        status: {
          open: '#7BA05B',
          warning: '#E8A838',
          closed: '#C75B5B',
          info: '#4A8DB7',
        },
        phin: {
          50: '#FAF7F2',
          100: '#F5E6D3',
          200: '#E8D5C0',
          300: '#D48B5C',
          400: '#C68E5C',
          500: '#8B6B4A',
          600: '#6F4E37',
          700: '#5A3E2E',
          800: '#4D3427',
          900: '#2C1810',
          950: '#1A0E0A',
        },
      },
      fontFamily: {
        body: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-playfair)', 'serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(44, 24, 16, 0.08), 0 1px 4px -1px rgba(44, 24, 16, 0.04)',
        'card-hover': '0 8px 16px -4px rgba(44, 24, 16, 0.12), 0 4px 8px -2px rgba(44, 24, 16, 0.06)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        heartPop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        slideUp: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        heartPop: 'heartPop 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
