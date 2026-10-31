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
        // Deep-Blue Primary Scale (50-950)
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
          50: "var(--primary-50)",
          100: "var(--primary-100)",
          200: "var(--primary-200)",
          300: "var(--primary-300)",
          400: "var(--primary-400)",
          500: "var(--primary-500)",
          600: "var(--primary-600)",
          700: "var(--primary-700)",
          800: "var(--primary-800)",
          900: "var(--primary-900)",
          950: "var(--primary-950)",
        },
        // Vibrant Accent Scale (50-950)
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
          50: "var(--accent-50)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          300: "var(--accent-300)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
          800: "var(--accent-800)",
          900: "var(--accent-900)",
          950: "var(--accent-950)",
        },
        // Neutral Grey Scale (50-950)
        neutral: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          300: "var(--neutral-300)",
          400: "var(--neutral-400)",
          500: "var(--neutral-500)",
          600: "var(--neutral-600)",
          700: "var(--neutral-700)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
          950: "var(--neutral-950)",
        },
        // WCAG AA Accessible Emerald Scale
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#047857", // WCAG AA compliant >= 5.04:1 against white & #f8fafc
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        // Semantic Colors
        success: {
          50: "var(--success-50)",
          DEFAULT: "var(--success-500)",
          500: "var(--success-500)",
          700: "var(--success-700)",
        },
        warning: {
          50: "var(--warning-50)",
          DEFAULT: "var(--warning-500)",
          500: "var(--warning-500)",
          700: "var(--warning-700)",
        },
        danger: {
          50: "var(--danger-50)",
          DEFAULT: "var(--danger-500)",
          500: "var(--danger-500)",
          700: "var(--danger-700)",
        },
        info: {
          50: "var(--info-50)",
          DEFAULT: "var(--info-500)",
          500: "var(--info-500)",
          700: "var(--info-700)",
        },
        // Mobile Money Operators
        momo: {
          mpesa: "#E60000",
          airtel: "#E60012",
          orange: "#FF7900",
          africell: "#6C1D5F",
        },
        // Surface & Background aliases
        surface: {
          50: "var(--neutral-50)",
          100: "var(--neutral-100)",
          200: "var(--neutral-200)",
          800: "var(--neutral-800)",
          900: "var(--neutral-900)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        "elevation-1": "var(--shadow-elevation-1)",
        "elevation-2": "var(--shadow-elevation-2)",
        "elevation-3": "var(--shadow-elevation-3)",
        // Backwards compatibility aliases
        soft: "var(--shadow-elevation-1)",
        floating: "var(--shadow-elevation-2)",
      },
      spacing: {
        "2xs": "var(--spacing-2xs)",
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        "2xl": "var(--spacing-2xl)",
        "3xl": "var(--spacing-3xl)",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }], // 10px / 14px
        xs: ["0.75rem", { lineHeight: "1rem" }],          // 12px / 16px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],      // 14px / 20px
        base: ["1rem", { lineHeight: "1.5rem" }],         // 16px / 24px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],      // 18px / 28px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],       // 20px / 28px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],        // 24px / 32px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],   // 30px / 36px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],      // 36px / 40px
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      screens: {
        xs: "360px",
      },
    },
  },
  plugins: [],
};

export default config;
