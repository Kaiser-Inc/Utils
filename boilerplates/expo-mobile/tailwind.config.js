/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6366f1",
        "primary-foreground": "#ffffff",
        background: "#ffffff",
        foreground: "#0f172a",
        card: "#f8fafc",
        border: "#e2e8f0",
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        destructive: "#ef4444",
      },
    },
  },
};
