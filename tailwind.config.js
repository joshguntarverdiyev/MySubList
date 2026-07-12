/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#6C47D9',
        secondary: '#8B5CF6',
        splash: '#7C4DFF',
        background: '#F0EBFF',
        surface: '#FFFFFF',
        text: '#1A1A2E',
        muted: '#6B7280',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        'icon-bg': '#EDE9F8',
        dot: {
          weekly: '#EC4899',
          monthly: '#8B5CF6',
          yearly: '#EF4444',
        },
      },
    },
  },
  plugins: [],
};
