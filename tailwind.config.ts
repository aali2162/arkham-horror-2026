import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ark: {
          // Core backgrounds — deep ink black, aged paper
          bg: "#0a0805",
          surface: "#161209",
          card: "#1e1810",
          "card-hover": "#221c16",
          border: "#3d3020",
          "border-light": "#5c4a2a",
          "border-gold": "#8b6914",

          // Gold — Art Deco accent, aged brass
          gold: "#c9973a",
          "gold-bright": "#e8b84b",
          "gold-dim": "#7a5c1e",
          "gold-glow": "rgba(201, 151, 58, 0.15)",

          // Class colors — authentic Arkham Horror LCG
          blue: "#4a8fd4",        // Guardian
          "blue-dim": "#2d5a8e",
          "blue-glow": "rgba(74, 143, 212, 0.15)",

          green: "#3a9e6b",       // Rogue
          "green-dim": "#256b47",
          "green-glow": "rgba(58, 158, 107, 0.12)",

          red: "#c0392b",         // Survivor / Damage — deep crimson
          "red-bright": "#e74c3c",
          "red-dim": "#8e1a0e",
          "red-glow": "rgba(192, 57, 43, 0.15)",

          amber: "#d4922a",       // Seeker — aged yellow
          "amber-bright": "#f0a832",
          "amber-dim": "#8a5e18",

          purple: "#7c5cbf",      // Mystic
          "purple-bright": "#9b7dd4",
          "purple-dim": "#4a3578",
          "purple-glow": "rgba(124, 92, 191, 0.15)",

          // Horror / sanity — desaturated blue-green
          horror: "#4a8080",
          "horror-dim": "#2d5050",

          // Text — clean readable tones
          text: "#f0eee8",
          "text-dim": "#c4bdb0",
          "text-muted": "#8a8278",
          "text-gold": "#c9973a",

          // Sepia tones for variety
          sepia: "#2e2318",
          "sepia-light": "#4a3828",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Inter"', "system-ui", "sans-serif"],
        decorative: ['"Inter"', "system-ui", "sans-serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"],
        serif: ['"Crimson Text"', "Georgia", "serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        "flicker": "flicker 3s ease-in-out infinite",
        "drift": "drift 8s ease-in-out infinite",
        "shimmer": "shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201, 151, 58, 0.08)" },
          "50%": { boxShadow: "0 0 40px rgba(201, 151, 58, 0.2), 0 0 80px rgba(201, 151, 58, 0.06)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" },
          "93%": { opacity: "0.8" },
          "94%": { opacity: "1" },
          "96%": { opacity: "0.9" },
          "97%": { opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%": { transform: "translateY(-8px) translateX(4px)" },
          "66%": { transform: "translateY(4px) translateX(-6px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      backgroundImage: {
        "gold-shimmer": "linear-gradient(90deg, transparent, rgba(201,151,58,0.3), transparent)",
        "parchment": "radial-gradient(ellipse at top, #1a1410 0%, #0a0805 100%)",
        "vignette": "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)",
      },
      boxShadow: {
        "gold": "0 0 20px rgba(201, 151, 58, 0.2), 0 4px 16px rgba(0,0,0,0.5)",
        "gold-sm": "0 0 10px rgba(201, 151, 58, 0.15)",
        "card": "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,151,58,0.05)",
        "card-hover": "0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(201,151,58,0.1), inset 0 1px 0 rgba(201,151,58,0.1)",
        "inner-gold": "inset 0 0 30px rgba(201,151,58,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
