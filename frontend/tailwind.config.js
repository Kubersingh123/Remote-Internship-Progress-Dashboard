/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#dff2ff",
          500: "#0ea5e9",
          700: "#0369a1",
          900: "#082f49"
        }
      },
      boxShadow: {
        panel: "0 12px 36px rgba(15, 23, 42, 0.12)"
      }
    },
  },
  plugins: [],
};
