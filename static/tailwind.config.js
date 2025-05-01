/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ["./*.html"],
  safelist: [
    'grid-cols-2',
    'flex',
    'flex-grow',
    'h-full',
    'overflow-hidden',
    'bg-white',
    'dark:bg-gray-900',
    'text-gray-900',
    'dark:text-gray-100',
    'border',
    'rounded',
    'p-2',
    'text-sm',
    'resize-none',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

