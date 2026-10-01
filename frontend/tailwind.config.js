/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moment: {
          50: '#FDF8F7',
          100: '#FAF0ED',
          200: '#F5DDD7',
          300: '#ECC3B9',
          400: '#E09C8D',
          500: '#C2826A',
          600: '#A86850',
          700: '#8A5040',
          800: '#6E3E31',
          900: '#543025',
        },
        sage: {
          50: '#F4F7F5',
          100: '#E6ECE8',
          200: '#CFDCD3',
          300: '#AEC4B5',
          400: '#87A691',
          500: '#678B72',
          600: '#516E5A',
          700: '#415748',
          800: '#36463B',
          900: '#2D3931',
        },
        clinical: {
          red: '#B91C1C',
          yellow: '#B08050',
          green: '#6B8F71',
          blue: '#2563EB',
        },
        ivory: {
          DEFAULT: '#FAF8F5',
          dark: '#F3EFE9',
          border: '#E8E2DA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        editorial: ['Lora', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card': '0 4px 16px -2px rgba(0,0,0,0.06), 0 2px 6px -1px rgba(0,0,0,0.03)',
        'modal': '0 20px 48px -8px rgba(0,0,0,0.18), 0 8px 20px -4px rgba(0,0,0,0.08)',
        'header': '0 1px 0 0 #E8E2DA',
      },
      letterSpacing: {
        'tightest': '-0.04em',
        'tighter': '-0.02em',
      },
    },
  },
  plugins: [],
}
