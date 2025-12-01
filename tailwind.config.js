/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#40c004ff',
        seconday: '#151312',
        accent: '#ab8bff',
        light: {
          100: '#d6c6ff',
          200: '#a8b5db',
          300: '#9ca4ab'
        },
        dark: {
          100: '#221f3d',
          200: '#0f0d23'
        }
      }
    },
  },
  plugins: [],
}