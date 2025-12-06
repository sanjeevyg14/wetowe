/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          olive: '#3A4D39',
          sage: '#739072',
          cream: '#F9F5EB',
          beige: '#ECE3CE',
          black: '#1A1A1A',
          purple: '#3A4D39', 
          darkPurple: '#1A1A1A',
          orange: '#D4A373',
          light: '#F9F5EB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    }
  },
  plugins: [],
}