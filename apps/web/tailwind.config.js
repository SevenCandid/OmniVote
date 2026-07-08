/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4F46E5",
        secondary: "#0D9488",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
        background: {
          light: "#FAFAFA",
          dark: "#09090B",
        },
        surface: {
          light: "#FFFFFF",
          dark: "#18181B",
        }
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
