import type { Config } from "tailwindcss";

// Design tokens sampled directly from the Figma export (Figma_ui.zip).
// Keep these as the single source of truth for brand colors so every
// screen stays visually consistent with the original design.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#161950", // dark hero panel / logo wordmark
          blue: "#155DFC", // primary buttons, active nav, links
          "blue-dark": "#1E3FAE", // hover/darker CTA (sign up button)
          bgblue: "#EBF9FF", // page content background
        },
        status: {
          success: "#16A34A",
          "success-bg": "#DCFCE7",
          warning: "#D97706",
          "warning-bg": "#FEF3C7",
          critical: "#DC2626",
          "critical-bg": "#FEE2E2",
          info: "#2563EB",
          "info-bg": "#DBEAFE",
          pending: "#7C3AED",
          "pending-bg": "#EDE9FE",
        },
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
