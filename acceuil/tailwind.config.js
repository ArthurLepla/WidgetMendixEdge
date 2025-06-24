/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                barlow: ['Barlow', 'sans-serif'],
            },
            colors: {
                'dashboard-background': '#ffffff',
                'dashboard-card': '#ffffff',
                primary: {
                    100: '#F3F4FF',
                    200: '#E5E7FF',
                    300: '#6366F1',
                    400: '#4F46E5',
                    500: '#4338CA'
                },
                secondary: {
                    100: '#F5F3FF',
                    200: '#EDE9FE',
                    300: '#8B5CF6',
                    400: '#7C3AED',
                    500: '#6D28D9'
                }
            },
            maxWidth: {
                "4xl": "56rem",
                "7xl": "80rem"
            },
            scale: {
                '102': '1.02'
            },
            blur: {
                '3xl': '64px'
            }
        }
    },
    plugins: []
}; 