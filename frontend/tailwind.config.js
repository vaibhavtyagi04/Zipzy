/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        phantom: {
          purple: "#AB9FF2",
          bg: "#0F0F0F",
          card: "#1A1A1A",
          accent: "#2C2C2E",
          text: "#F5F5F7"
        }
      }
    },
  },
  plugins: [],
}

