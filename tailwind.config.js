/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // or 'media'
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./features/**/*.{js,ts,jsx,tsx}",
      "./design-system/**/*.{js,ts,jsx,tsx}",
      "./index.html"
    ],
    theme: {
      extend: {
        colors: {
          background: "var(--color-background)",
          surface: "var(--color-surface)",
          'surface-secondary': "var(--color-surface-secondary)",
          'surface-tertiary': "var(--color-surface-tertiary)",
          overlay: "var(--color-overlay)",
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
          accent: "var(--color-accent)",
          'accent-secondary': "var(--color-accent-secondary)",
          border: "var(--color-border)",
          'border-strong': "var(--color-border-strong)",
          'border-accent': "var(--color-border-accent)",
          'border-focus': "var(--color-border-focus)",
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          error: "var(--color-error)",
          info: "var(--color-info)",
          // Add more as needed
        }
      }
    },
    plugins: [],
  }