/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        /* ── Brand Purple ── */
        purple: {
          50:  "#f1ebff",
          100: "#e0d2ff",
          200: "#c4acff",
          300: "#a78bfa",
          400: "#996dff",
          500: "#8257e6",
          600: "#6938ee",
          700: "#5a3fbe",
          800: "#402090",
          900: "#2a1466",
        },

        /* ── Neutral Gray (KaiserInc) ── */
        gray: {
          50:  "#fafafc",
          100: "#e1e1e6",
          200: "#c4c4cc",
          300: "#8d8d99",
          400: "#7c7c8a",
          500: "#505059",
          600: "#323238",
          700: "#29292e",
          800: "#202024",
          900: "#121214",
          950: "#09090a",
        },

        /* ── KaiserInc semantic — dark-first (valores hardcoded, sem CSS vars) ── */
        brand:          "#8257e6",
        "brand-hover":  "#996dff",
        "brand-active": "#6938ee",

        "bg-base":      "#09090a",
        "bg-surface":   "#121214",
        "bg-elevated":  "#202024",

        "fg-1":         "#fafafc",
        "fg-2":         "#e1e1e6",
        "fg-3":         "#8d8d99",
        "fg-4":         "#7c7c8a",
        "fg-5":         "#505059",

        "border-subtle":  "#202024",
        "border-default": "#29292e",
        "border-strong":  "#505059",

        /* ── Status ── */
        "success-300": "#04d361",
        "success-500": "#00b37e",
        "warning-300": "#ffca80",
        "warning-500": "#fba94c",
        "danger-300":  "#fba1a8",
        "danger-500":  "#f75a68",

        /* ── Shadcn-compat aliases (componentes existentes) ── */
        primary:                "#8257e6",
        "primary-foreground":   "#ffffff",
        secondary:              "#00b37e",
        "secondary-foreground": "#09090a",
        background:             "#09090a",
        foreground:             "#fafafc",
        card:                   "#121214",
        "card-foreground":      "#fafafc",
        border:                 "#202024",
        muted:                  "#202024",
        "muted-foreground":     "#7c7c8a",
        destructive:            "#f75a68",
        "destructive-foreground": "#ffffff",
        success:                "#04d361",
        "success-foreground":   "#09090a",
        warning:                "#fba94c",
        "warning-foreground":   "#09090a",
      },

      borderRadius: {
        none:   "0px",
        xs:     "2px",
        sm:     "4px",
        DEFAULT: "6px",
        md:     "6px",
        lg:     "8px",
        xl:     "12px",
        "2xl":  "16px",
        "3xl":  "24px",
        pill:   "999px",
        full:   "9999px",
      },
    },
  },
};
