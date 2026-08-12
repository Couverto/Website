/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#173B15",
          light: "#1a4518",
        },
        accent: {
          DEFAULT: "#2ecc9a",
          dark: "#25b388",
        },
        surface: "#f9fafb",
        border: "#e5e7eb",
        muted: "#6b7280",
        danger: "#d32f2f",
        warning: "#92400e",
        "warning-bg": "#fef3c7",
        success: "#166534",
        "success-bg": "#dcfce7",
      },
    },
  },
  plugins: [],
};
