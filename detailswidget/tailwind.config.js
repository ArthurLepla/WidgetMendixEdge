/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0595DB',
          hover: '#0477AF',
        },
        secondary: {
          DEFAULT: '#2DBAFC',
          hover: '#0595DB',
        },
        energy: {
          electricity: '#38a13c',
          gas: '#F9BE01',
          water: '#3293f3',
          air: '#66D8E6'
        }
      },
    },
  },
  plugins: [],
  // Prevent conflicts with Mendix styling
  important: true,
  // Prefix all Tailwind classes to avoid conflicts
  prefix: 'tw-',
} 