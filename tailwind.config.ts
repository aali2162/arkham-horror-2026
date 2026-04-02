import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ark: {
          bg: "#0c0f14",
          surface: "#161b24",
          card: "#1c2230",
          border: "#2a3245",
          "border-light": "#3a4560",
          blue: "#4a9eff",
          "blue-dim": "#2563eb",
          "blue-glow": "rgba(74, 158, 255, 0.15)",
          green: "#34d399",
          "green-dim": "#16a34a",
          "green-glow": "rgba(52, 211, 153, 0.1)",
          red: "#f87171",
          "red-dim": "#dc2626",
          amber: "#fbbf24",
          purple: "#a78bfa",
          text: "#e8ecf4",
          "text-dim": "#8896ab",
          "text-muted": "#5a6a80",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        body: ['"Source Sans 3"', '"Source Sans Pro"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "Consolas", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(74, 158, 255, 0.1)" },
          "50%": { boxShadow: "0 0 30px rgba(74, 158, 255, 0.25)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
