import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
        'sans': ['Roboto', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
          light: "hsl(var(--primary-light))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          hover: "hsl(var(--secondary-hover))",
          light: "hsl(var(--secondary-light))",
        },
        tertiary: {
          DEFAULT: "hsl(var(--tertiary))",
          foreground: "hsl(var(--tertiary-foreground))",
          light: "hsl(var(--tertiary-light))",
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
        action: {
          DEFAULT: "hsl(var(--action))",
          hover: "hsl(var(--action-hover))",
          light: "hsl(var(--action-light))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        agro: {
          green: "hsl(var(--agro-green))",
          blue: "hsl(var(--agro-blue))",
          earth: "hsl(var(--agro-earth))",
          sky: "hsl(var(--agro-sky))",
          leaf: "hsl(var(--agro-leaf))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
          6: "hsl(var(--chart-6))",
          7: "hsl(var(--chart-7))",
          8: "hsl(var(--chart-8))",
          9: "hsl(var(--chart-9))",
          10: "hsl(var(--chart-10))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "bounce-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.9)",
          },
          "50%": {
            opacity: "0.8",
            transform: "scale(1.05)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
          },
        },
        "grow-in": {
          "0%": {
            opacity: "0",
            transform: "scaleY(0)",
            transformOrigin: "bottom",
          },
          "100%": {
            opacity: "1",
            transform: "scaleY(1)",
            transformOrigin: "bottom",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "bounce-in": "bounce-in 0.6s ease-out",
        "grow-in": "grow-in 0.6s ease-out",
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-secondary": "var(--gradient-secondary)",
        "gradient-background": "var(--gradient-background)",
        "gradient-hero": "var(--gradient-hero)",
        "gradient-card-hover": "var(--gradient-card-hover)",
        "gradient-subtle": "var(--gradient-subtle)",
        "gradient-radial": "var(--gradient-radial)",
        "gradient-glow": "var(--gradient-glow)",
        "gradient-border": "var(--gradient-border)",
        "gradient-mesh": "var(--gradient-mesh)",
        "gradient-glass": "var(--gradient-glass)",
      },
      boxShadow: {
        "soft": "var(--shadow-soft)",
        "medium": "var(--shadow-medium)",
        "large": "var(--shadow-large)",
        "glow": "var(--shadow-glow)",
        "elegant": "var(--shadow-elegant)",
        "glow-lg": "var(--shadow-glow-lg)",
        "inner-glow": "var(--shadow-inner-glow)",
      },
      transitionTimingFunction: {
        "smooth": "var(--transition-smooth)",
        "bounce": "var(--transition-bounce)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
