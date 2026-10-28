/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#08090B',
          secondary: '#101216',
          sidebar: '#0C0D10',
          card: '#14161B',
          elevated: '#1B1E24',
        },
        primary: {
          yellow: '#FFD400',
          hover: '#FFE45C',
        },
        text: {
          main: '#F5F5F5',
          secondary: '#A0A5AF',
        },
        border: {
          subtle: '#292D35',
        },
      },
      borderRadius: {
        card: '14px',
        'card-lg': '18px',
      },
    },
  },
  plugins: [],
};

