/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B1020',
          sidebar: '#12192E',
          card: '#1A2140',
          hover: '#2C3766',
        },
        accent: {
          DEFAULT: '#6D5DF6',
          hover: '#5849d4',
          light: '#8B7DF8',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B8C1EC',
          muted: '#6B7280',
        },
        border: {
          DEFAULT: '#1E2A4A',
          light: '#2C3766',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(109, 93, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(109, 93, 246, 0.8)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
