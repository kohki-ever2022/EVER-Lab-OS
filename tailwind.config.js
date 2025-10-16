/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans JP', '-apple-system', 'sans-serif'],
      },
      colors: {
        'ever-blue': '#5AC8E5',
        'ever-purple': '#A593CC',
        'ever-black': '#0A0A0A',
        'ever-blue-dark': '#3A98B5',
        'ever-purple-dark': '#7D6CA0',
        'ever-blue-light': '#E6F7FB',
        'ever-purple-light': '#F3EFFB',
        'lab-blue': '#5AC8E5',
        'lab-blue-dark': '#3A98B5',
        'lab-purple': '#A593CC',
        'text-primary': '#2D2D2D',
        'text-secondary': '#4b5563',
      }
    }
  },
  plugins: [],
}