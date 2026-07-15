import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        navy: {
          50: "#e8edf5",
          100: "#c5d1e8",
          200: "#9fb2d8",
          300: "#7893c8",
          400: "#5a7abd",
          500: "#1e3a5f",
          600: "#1a3356",
          700: "#152b4c",
          800: "#102340",
          900: "#091830",
        },
        gold: {
          50: "#fdf9e8",
          100: "#f9f0c5",
          200: "#f4e49e",
          300: "#eed877",
          400: "#e9cd58",
          500: "#d4af37",
          600: "#c49e2f",
          700: "#b08a25",
          800: "#9c771b",
          900: "#7d5e0e",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // --- Design System v1 (additive only — see DESIGN_SYSTEM.md) ---
        // Neutral scale used by the new component library. Does not replace
        // any existing token; existing pages are unaffected.
        ink: {
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
          950: "#020617",
        },
        // Chart/informational accent, distinct from brand navy (§1.3)
        signal: {
          DEFAULT: "#2A78D6",
          dark: "#3987E5",
        },
        // Status tokens shared between badges and charts (§1.5)
        status: {
          success: "#0CA30C",
          warning: "#B8790E",
          serious: "#C24F1E",
          critical: "#D03B3B",
        },
        // Dark-mode navy-tinted elevation ladder (§15.1)
        surface: {
          0: "#05070C",
          1: "#0B1424",
          2: "#121D33",
        },
        // Scoped rebrand for the landing page Hero + Services sections only
        // (see page.tsx) — Yale Blue primary, Cream accent, per design brief.
        yale: {
          DEFAULT: "#0F4D92",
          dark: "#0B3A70",
        },
        cream: {
          DEFAULT: "#FAF0CA",
          dark: "#F0DFA0",
        },
        // Dark Yale Blue sidebar palette (matches the landing page brand
        // fill — navy-500 #1e3a5f is used for the active nav item's text).
        sidebar: {
          DEFAULT: "#1E3A5F",
          hover: "#28466E",
          border: "#2C4C74",
          icon: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Design System v1 radius scale (§4) — "ds-" prefixed so it never
        // collides with the sm/md/lg overrides above that existing pages use.
        "ds-sm": "6px",
        "ds-md": "8px",
        "ds-lg": "10px",
        "ds-xl": "12px",
      },
      boxShadow: {
        // Design System v1 shadow scale (§5) — "ds-" prefixed, additive only.
        "ds-xs": "0 1px 2px rgba(15,23,42,0.04)",
        "ds-sm": "0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)",
        "ds-md": "0 4px 16px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)",
        "ds-lg": "0 12px 32px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.04)",
        "ds-focus": "0 0 0 3px rgba(30,58,95,0.16)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
