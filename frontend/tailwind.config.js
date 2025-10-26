/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "Apple Color Emoji", "Segoe UI Emoji"],
        display: ["Space Grotesk", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        cosmic: {
          50: '#f5f7ff',
          100: '#eaeefe',
          200: '#d9defe',
          300: '#c0c8fd',
          400: '#a1a9fb',
          500: '#8184f7',
          600: '#6a68ee',
          700: '#584edc',
          800: '#483fba',
          900: '#3c3698',
        },
      },
    },
  },
  plugins: [],
};
