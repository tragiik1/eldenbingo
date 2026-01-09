/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elden Ring inspired palette - muted golds, deep shadows, ancient parchment
        gold: {
          50: '#fefdf8',
          100: '#fdf8e6',
          200: '#f9edc0',
          300: '#f3dc8a',
          400: '#ebc754',
          500: '#d4a84a',
          600: '#b8893d',
          700: '#936932',
          800: '#7a552d',
          900: '#674728',
        },
        parchment: {
          50: '#faf8f3',
          100: '#f3efe4',
          200: '#e8e0d0',
          300: '#d6c9b3',
          400: '#c2ad93',
          500: '#a89070',
          600: '#8d7458',
          700: '#745f49',
          800: '#5f4e3e',
          900: '#4a3d32',
        },
        shadow: {
          50: '#f4f4f5',
          100: '#e4e4e7',
          200: '#c8c8cd',
          300: '#9e9ea6',
          400: '#71717a',
          500: '#52525b',
          600: '#3f3f46',
          700: '#2d2d33',
          800: '#1f1f23',
          900: '#131316',
          950: '#0a0a0c',
        },
        blood: {
          500: '#8b3a3a',
          600: '#722f2f',
          700: '#5c2626',
        },
        fog: {
          400: 'rgba(200, 195, 188, 0.08)',
          500: 'rgba(200, 195, 188, 0.12)',
          600: 'rgba(200, 195, 188, 0.18)',
        }
      },
      fontFamily: {
        // Serif for headings - arcane, ancient feel
        heading: ['Cinzel', 'Palatino Linotype', 'Palatino', 'serif'],
        // Clean sans for body - readable but not sterile
        body: ['Crimson Pro', 'Georgia', 'serif'],
        // UI elements
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'glow': 'glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
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
        glow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glow': '0 0 40px rgba(212, 168, 74, 0.15)',
        'glow-strong': '0 0 60px rgba(212, 168, 74, 0.25)',
        'inner-glow': 'inset 0 0 30px rgba(212, 168, 74, 0.1)',
      },
    },
  },
  plugins: [],
}
