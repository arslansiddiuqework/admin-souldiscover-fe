import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: "var(--accent)",

        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          light: "var(--primary-light)",
          foreground: "var(--primary-foreground)",
          container: "var(--primary-container)",
          soft: "var(--primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
          foreground: "var(--secondary-foreground)",
          container: "var(--secondary-container)",
        },

        surface: {
          DEFAULT: "var(--surface)",
          dim: "var(--surface-dim)",
          bright: "var(--surface-bright)",
          variant: "var(--surface-variant)",
          container: "var(--surface-container)",
          "container-high": "var(--surface-container-high)",
          "container-highest": "var(--surface-container-highest)",
        },

        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
          container: "var(--success-container)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
          container: "var(--warning-container)",
        },
        error: {
          DEFAULT: "var(--error)",
          foreground: "var(--error-foreground)",
          container: "var(--error-container)",
        },
        info: {
          DEFAULT: "var(--info)",
          foreground: "var(--info-foreground)",
          container: "var(--info-container)",
        },

        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },
        ring: "var(--ring)",
        scrim: "var(--scrim)",

        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "on-surface-muted": "var(--on-surface-muted)",
        "on-primary-container": "var(--on-primary-container)",
        "on-secondary-container": "var(--on-secondary-container)",
        "on-success-container": "var(--on-success-container)",
        "on-warning-container": "var(--on-warning-container)",
        "on-error-container": "var(--on-error-container)",
        "on-info-container": "var(--on-info-container)",
        "on-error": "var(--error-foreground)",
      },

      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
        // Retained alias so pre-existing `font-hanken` markup keeps working.
        hanken: ["var(--font-jakarta)", "var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      spacing: {
        sidebar: "264px",
        topbar: "68px",
      },

      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.75rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },

      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        lifted: "var(--shadow-lifted)",
        popover: "var(--shadow-popover)",
        primary: "var(--shadow-primary)",
        glass: "var(--shadow-glass)",
        nav: "var(--shadow-nav)",
      },

      ringColor: {
        DEFAULT: "var(--ring)",
      },

      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "zoom-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-left": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },

      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        "zoom-in": "zoom-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up": "slide-up 0.24s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-down": "slide-down 0.18s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-left": "slide-left 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};
export default config;
