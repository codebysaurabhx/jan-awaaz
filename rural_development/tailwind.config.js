/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: false,
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#14532D',
        secondary: '#F59E0B',
        background: '#F8FAFC',
        text: '#0F172A',
        success: '#10B981',
        pending: '#F59E0B',
        critical: '#EF4444',
      },
    },
  },
  plugins: [],
};
