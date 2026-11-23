import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        // FinControle Precision Design System
        // Light Mode
        "fc-bg": "#f4f8fc",
        "fc-surface": "#ffffff",
        "fc-subtle": "#f8fafc",
        "fc-border": "#e3ebf3",
        "fc-border-hover": "#cbd9e8",
        "fc-border-focus": "#4f8fcb",
        "fc-text": "#2b3a4a",
        "fc-muted": "#7a8a9a",
        // Semantic
        "fc-gain": "#3fa57f",
        "fc-gain-bg": "#e6f6ef",
        "fc-gain-border": "#bde5d4",
        "fc-expense": "#d9606b",
        "fc-expense-bg": "#fdecee",
        "fc-expense-border": "#f8c9cf",
        "fc-accent": "#4f8fcb",
        "fc-accent-bg": "#e8f1fa",
        "fc-accent-hover": "#3d7cb8",
        "fc-pending": "#b7861a",
        "fc-pending-bg": "#fff4dc",
        "fc-pending-border": "#f5dfab",
        // Dark Mode
        "fc-dark-bg": "#121a24",
        "fc-dark-surface": "#1b2633",
        "fc-dark-subtle": "#17222f",
        "fc-dark-border": "#2a394a",
        "fc-dark-border-hover": "#3b4e64",
        "fc-dark-border-focus": "#7db4e8",
        "fc-dark-text": "#e6edf5",
        "fc-dark-muted": "#93a4b6",
        "fc-dark-gain": "#6fd1a8",
        "fc-dark-gain-bg": "#1b3a31",
        "fc-dark-expense": "#f08a93",
        "fc-dark-expense-bg": "#3d2329",
        "fc-dark-accent": "#7db4e8",
        "fc-dark-accent-bg": "#1e3348",
        "fc-dark-pending": "#e0b954",
        "fc-dark-pending-bg": "#3a321a",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        "fc-sm": "0 1px 3px rgba(0,0,0,0.04)",
        "fc-md": "0 4px 12px rgba(43,58,74,0.05)",
        "fc-lg": "0 12px 28px rgba(43,58,74,0.08)",
        "fc-dark-sm": "0 1px 3px rgba(0,0,0,0.22)",
        "fc-dark-md": "0 4px 12px rgba(0,0,0,0.32)",
        "fc-dark-lg": "0 12px 30px rgba(0,0,0,0.44)",
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["14px", { lineHeight: "20px" }],
        md: ["15px", { lineHeight: "22px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["22px", { lineHeight: "30px" }],
        "3xl": ["28px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "44px" }],
      },
    },
  },
  plugins: [],
};

export default config;
