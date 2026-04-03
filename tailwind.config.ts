import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ark: {
          // ── Core backgrounds — aged parchment / rulebook page
          bg:           "#f2e8cc",   // warm parchment cream — the rulebook page
          surface:      "#ecdcb0",   // slightly darker card surface
          card:         "#ecdcb0",   // card background
          "card-hover": "#e8d8a8",   // card hover — slightly deeper
          border:       "#c8a860",   // warm gold border
          "border-light":"#d4b870",
          "border-gold": "#8a6820",  // dark gold accent

          // ── Gold — aged brass, candlelight
          gold:          "#c9973a",
          "gold-bright": "#e8b84b",
          "gold-pale":   "#f0d080",
          "gold-dim":    "#7a5c1e",
          "gold-glow":   "rgba(201,151,58,0.18)",

          // ── Teal/green — the rulebook's signature teal (connection arrows, clue tokens)
          teal:          "#2e8b7a",
          "teal-bright": "#3aad98",
          "teal-dim":    "#1a5248",
          "teal-glow":   "rgba(46,139,122,0.18)",

          // ── Class colours — exact match to quick-reference page
          // Guardian: blue star
          blue:          "#4a8fd4",
          "blue-dark":   "#2d5a8e",
          "blue-glow":   "rgba(74,143,212,0.18)",
          // Seeker: amber/yellow magnifying glass
          amber:         "#c8871a",
          "amber-bright":"#e8a830",
          "amber-dim":   "#7a5010",
          // Mystic: purple triangle
          purple:        "#7050b8",
          "purple-bright":"#9070d8",
          "purple-dim":  "#3d2878",
          "purple-glow": "rgba(112,80,184,0.18)",
          // Rogue: green diamond
          green:         "#2e8a50",
          "green-bright":"#40b870",
          "green-dim":   "#1a5030",
          "green-glow":  "rgba(46,138,80,0.18)",
          // Survivor: red arrow
          red:           "#b82020",
          "red-bright":  "#d83030",
          "red-dim":     "#6e1010",
          "red-glow":    "rgba(184,32,32,0.18)",

          // ── Damage / Horror token colours (match physical tokens)
          damage:        "#c03028",  // red heart token
          horror:        "#3868a8",  // blue brain token

          // ── Text — dark sepia ink on parchment
          text:          "#2a1808",  // dark ink — primary body text
          "text-dim":    "#5a3a10",  // medium ink — secondary text
          "text-muted":  "#8a7040",  // muted ink — tertiary / labels
          "text-faint":  "#b89860",  // faint — placeholder / decorative

          // ── Sepia structural tones
          sepia:         "#2e2010",
          "sepia-light": "#4a3418",
          "sepia-mid":   "#6a5030",
        },
      },
      fontFamily: {
        // Title: Cinzel Decorative — ornate, matches rulebook chapter headers
        title:      ['"Cinzel Decorative"', 'Palatino', 'serif'],
        // Heading: Cinzel — clean classical serif for section headers, buttons
        heading:    ['"Cinzel"', 'Palatino', 'serif'],
        // Decorative: alias for heading (used throughout existing code)
        decorative: ['"Cinzel"', 'Palatino', 'serif'],
        // Body: Crimson Text — warm readable serif like the rulebook body text
        body:       ['"Crimson Text"', 'Georgia', 'serif'],
        sans:       ['"Crimson Text"', 'Georgia', 'serif'],
        display:    ['"Cinzel"', 'Palatino', 'serif'],
        // Flavour: IM Fell English italic — for quotes, flavour text
        flavour:    ['"IM Fell English"', 'Georgia', 'serif'],
        // Mono: keep for code/numbers
        mono:       ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      animation: {
        "fade-in":    "fadeIn 0.6s ease-out forwards",
        "slide-up":   "slideUp 0.6s ease-out forwards",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        "flicker":    "flicker 3s ease-in-out infinite",
        "drift":      "drift 8s ease-in-out infinite",
        "shimmer":    "shimmer 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp:   { "0%": { opacity: "0", transform: "translateY(24px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201,151,58,0.08)" },
          "50%":      { boxShadow: "0 0 40px rgba(201,151,58,0.22), 0 0 80px rgba(201,151,58,0.07)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "92%": { opacity: "1" }, "93%": { opacity: "0.8" },
          "94%": { opacity: "1" }, "96%": { opacity: "0.9" }, "97%": { opacity: "1" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%":      { transform: "translateY(-8px) translateX(4px)" },
          "66%":      { transform: "translateY(4px) translateX(-6px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
      backgroundImage: {
        "gold-shimmer": "linear-gradient(90deg, transparent, rgba(201,151,58,0.3), transparent)",
        "parchment":    "radial-gradient(ellipse at top, #1e1710 0%, #0e0b06 100%)",
        "vignette":     "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)",
      },
      boxShadow: {
        "gold":      "0 0 20px rgba(201,151,58,0.2), 0 4px 16px rgba(0,0,0,0.5)",
        "gold-sm":   "0 0 10px rgba(201,151,58,0.15)",
        "card":      "0 4px 24px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,151,58,0.05)",
        "card-hover":"0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(201,151,58,0.1), inset 0 1px 0 rgba(201,151,58,0.1)",
        "inner-gold":"inset 0 0 30px rgba(201,151,58,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
