const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#18213e",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // AlignUI color tokens
        "bg-white": {
          0: "#ffffff",
        },
        "bg-weak": {
          50: "#f9fafb",
        },
        "bg-soft": {
          200: "#e5e7eb",
        },
        "text-strong": {
          950: "#030712",
        },
        "text-sub": {
          600: "#4b5563",
        },
        "text-soft": {
          400: "#9ca3af",
        },
        "text-disabled": {
          300: "#d1d5db",
        },
        "stroke-soft": {
          200: "#e5e7eb",
        },
        "stroke-strong": {
          950: "#030712",
        },
        "error-base": "#ef4444",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        10: "0.625rem", // 10px
      },
      fontSize: {
        base: ['1.2rem', '1.75rem'],
        "paragraph-sm": ["0.875rem", "1.25rem"],
      },
      fontFamily: {
        barlow: ["Barlow", "sans-serif"],
      },
      zIndex: {
        '60': '60', // Pour TreeSelect dropdown
        '70': '70', // Pour les modales au-dessus
      },
      boxShadow: {
        "regular-xs": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        "regular-md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "button-important-focus": "0 0 0 2px rgb(59 130 246 / 0.5)",
        "button-error-focus": "0 0 0 2px rgb(239 68 68 / 0.5)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "zoom-in": {
          from: { transform: "scale(0.95)" },
          to: { transform: "scale(1)" },
        },
        "zoom-out": {
          from: { transform: "scale(1)" },
          to: { transform: "scale(0.95)" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-2px)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(2px)" },
          to: { transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "zoom-in-95": "zoom-in 0.2s ease-out",
        "zoom-out-95": "zoom-out 0.2s ease-out",
        "slide-in-from-top-2": "slide-in-from-top 0.2s ease-out",
        "slide-in-from-bottom-2": "slide-in-from-bottom 0.2s ease-out",
        "animate-in": "fade-in 0.2s ease-out, zoom-in 0.2s ease-out, slide-in-from-top 0.2s ease-out",
        "animate-out": "fade-out 0.2s ease-out, zoom-out 0.2s ease-out",
      },
    },
  },
  plugins: [
    plugin(function({ addVariant, addUtilities }) {
      // Pour les éléments inactifs (sans data-state="active")
      addVariant('inactive-hover', '&:not([data-state="active"]):not([data-disabled]):hover');
      
      // Utilitaires pour les animations AlignUI
      addUtilities({
        '.animate-in': {
          'animation-fill-mode': 'both',
        },
        '.animate-out': {
          'animation-fill-mode': 'both',
        },
        '.fade-in-0': {
          'animation-name': 'fade-in',
        },
        '.fade-out-0': {
          'animation-name': 'fade-out',
        },
        '.zoom-in-95': {
          'animation-name': 'zoom-in',
        },
        '.zoom-out-95': {
          'animation-name': 'zoom-out',
        },
        '.slide-in-from-top-2': {
          'animation-name': 'slide-in-from-top',
        },
        '.slide-in-from-bottom-2': {
          'animation-name': 'slide-in-from-bottom',
        },
      });
    })
  ],
};