/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#00A3E0",
        secondary: "#ffc74a",
        accent: "#34D399",
        gray: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        regular: ["ManropeRegular"],
        bold: ["ManropeBold"],
        extrabold: ["ManropeExtraBold"],
        extralight: ["ManropeExtraLight"],
        semibold: ["ManropeSemiBold"],
        medium: ["ManropeMedium"],
        light: ["ManropeLight"],
        serif: ["Merriweather", "serif"],
        axiforma: ["Axiforma"],
        'font-Axiforma': ["Axiforma"],
      },
    },
  },
  plugins: [],
};
