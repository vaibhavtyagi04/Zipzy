/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-light": "var(--accent-light)",
        surface: "var(--bg-surface)",
        secondary: "var(--bg-secondary)",
        theme: "var(--bg-primary)",
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          surface: "var(--bg-surface)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
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
