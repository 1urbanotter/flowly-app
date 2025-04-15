// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enables dark mode via .dark class
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Base Brand Colors
        "brand-dark": "#333131",
        "brand-light": "#EAEAEA",
        "brand-accent-green": "#43DFAE",
        "brand-accent-blue": "#2E20D0",

        // Themed Semantic System
        background: {
          DEFAULT: "#EAEAEA", // Light background
          dark: "#25252f", // Dark background (raisin_black)
        },
        foreground: {
          DEFAULT: "#333131", // Light text
          dark: "#f4f8f8", // Light text on dark bg (anti-flash white)
        },
        card: {
          DEFAULT: "#ffffff",
          dark: "#1d1d25",
        },
        primary: {
          DEFAULT: "#2E20D0", // Button blue
          dark: "#604bff", // Softer blue for dark
        },
        "primary-foreground": {
          DEFAULT: "#ffffff",
          dark: "#ffffff",
        },
        secondary: {
          DEFAULT: "#EAEAEA",
          dark: "#333131",
        },
        "secondary-foreground": {
          DEFAULT: "#333131",
          dark: "#ffffff",
        },
        muted: {
          DEFAULT: "#cbd5e1",
          dark: "#4c4c4c",
        },
        "muted-foreground": {
          DEFAULT: "#64748b",
          dark: "#a3a3a3",
        },
        accent: {
          DEFAULT: "#43DFAE",
          dark: "#1fe0f2",
        },
        "accent-foreground": {
          DEFAULT: "#333131",
          dark: "#0e0e12",
        },
        destructive: {
          DEFAULT: "#ef4444",
          dark: "#f87171",
        },
        "destructive-foreground": {
          DEFAULT: "#ffffff",
          dark: "#ffffff",
        },
        // Ratio Indicators
        "ratio-good": "#43DFAE",
        "ratio-ok": "#2E20D0",
        "ratio-poor": "#ef4444",
        "ratio-nodata": "#64748b",

        // Full Custom Palette
        raisin_black: {
          DEFAULT: "#25252f",
          100: "#070709",
          200: "#0e0e12",
          300: "#16161b",
          400: "#1d1d25",
          500: "#25252f",
          600: "#4a4a5e",
          700: "#6f6f8e",
          800: "#9f9fb4",
          900: "#cfcfd9",
        },
        blue: {
          DEFAULT: "#381eff",
          100: "#070039",
          200: "#0d0072",
          300: "#1400ab",
          400: "#1b00e4",
          500: "#381eff",
          600: "#604bff",
          700: "#8878ff",
          800: "#b0a5ff",
          900: "#d7d2ff",
        },
        moonstone: {
          DEFAULT: "#0cb9c9",
          100: "#022528",
          200: "#054b51",
          300: "#077079",
          400: "#0995a2",
          500: "#0cb9c9",
          600: "#1fe0f2",
          700: "#57e8f5",
          800: "#8ff0f8",
          900: "#c7f7fc",
        },
        "anti-flash_white": {
          DEFAULT: "#f4f8f8",
          100: "#263c3c",
          200: "#4c7777",
          300: "#7babab",
          400: "#b7d1d1",
          500: "#f4f8f8",
          600: "#f5f9f9",
          700: "#f8fafa",
          800: "#fafcfc",
          900: "#fdfdfd",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          '"Noto Sans"',
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
