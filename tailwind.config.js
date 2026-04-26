/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0A0D14',
        cyan: '#00D4FF',
        violet: '#7C3AED',
        textPrimary: '#F0F4FF',
        textMuted: '#6B7A9E',
        danger: '#FF4444',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0,212,255,0.3)',
        glowStrong: '0 0 30px rgba(0,212,255,0.4)',
      },
      borderRadius: {
        card: '16px',
        input: '12px',
      },
    },
  },
  plugins: [],
};
