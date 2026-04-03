import React from "react";
import Link from "next/link";

interface TopicCardProps {
  href: string;
  icon: string;
  title: string;
  tagline: string;
  color: "blue" | "green" | "red" | "purple" | "amber";
  detail?: string;
  difficulty?: string;
  delay?: number;
}

const colorConfig = {
  blue:   { hex: "#4a8fd4", glow: "rgba(74,143,212,0.15)",   bg: "rgba(74,143,212,0.06)",   border: "rgba(74,143,212,0.3)"  },
  green:  { hex: "#3a9e6b", glow: "rgba(58,158,107,0.15)",   bg: "rgba(58,158,107,0.06)",   border: "rgba(58,158,107,0.3)"  },
  red:    { hex: "#c0392b", glow: "rgba(192,57,43,0.18)",     bg: "rgba(192,57,43,0.07)",    border: "rgba(192,57,43,0.3)"   },
  purple: { hex: "#7c5cbf", glow: "rgba(124,92,191,0.18)",   bg: "rgba(124,92,191,0.07)",   border: "rgba(124,92,191,0.3)"  },
  amber:  { hex: "#d4922a", glow: "rgba(212,146,42,0.18)",   bg: "rgba(212,146,42,0.07)",   border: "rgba(212,146,42,0.3)"  },
};

// Art Deco SVG icon per topic
const topicIcons: Record<string, JSX.Element> = {
  "Phase 1: Mythos": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="9" strokeDasharray="2 3"/>
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 3v3 M12 18v3 M3 12h3 M18 12h3" strokeWidth="1.8"/>
      <path d="M9 12 A4 4 0 0 1 12 8" strokeWidth="2"/>
    </svg>
  ),
  "Phase 2: Investigation": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="10" cy="10" r="6"/>
      <line x1="14.5" y1="14.5" x2="20" y2="20" strokeWidth="2.2"/>
      <line x1="10" y1="7" x2="10" y2="13"/>
      <line x1="7" y1="10" x2="13" y2="10"/>
    </svg>
  ),
  "Phase 3: Enemy": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="9" r="6"/>
      <path d="M9 9 a1 1 0 0 1 2 0 1 1 0 0 1-2 0 M13 9 a1 1 0 0 1 2 0 1 1 0 0 1-2 0" fill="currentColor" stroke="none"/>
      <path d="M9 13 q3 2.5 6 0"/>
      <path d="M8 18 v4 M12 17 v5 M16 18 v4"/>
    </svg>
  ),
  "Phase 4: Upkeep": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <polyline points="23,4 23,10 17,10"/>
      <polyline points="1,20 1,14 7,14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  ),
  "Skill Tests": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9 9 h6 l-3 4 h4"/>
      <line x1="12" y1="3" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="21"/>
      <line x1="3" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="21" y2="12"/>
    </svg>
  ),
  "Damage & Trauma": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
      <circle cx="12" cy="9" r="6"/>
      <path d="M9 9 a1 1 0 0 1 2 0 1 1 0 0 1-2 0 M13 9 a1 1 0 0 1 2 0 1 1 0 0 1-2 0" fill="currentColor" stroke="none"/>
      <path d="M9 13 q3 -2 6 0"/>
      <path d="M8 18 v4 M12 17 v5 M16 18 v4"/>
      <line x1="6" y1="4" x2="4" y2="2" strokeWidth="2"/>
      <line x1="18" y1="4" x2="20" y2="2" strokeWidth="2"/>
    </svg>
  ),
};

export default function TopicCard({ href, title, tagline, color, detail, difficulty, delay = 0 }: TopicCardProps) {
  const c = colorConfig[color];
  const icon = topicIcons[title];

  return (
    <Link
      href={href}
      className="group block opacity-0 animate-slide-up"
      style={{ animationDelay: `${delay * 0.07}s` }}
    >
      <div
        className="h-full rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(145deg, #161008 0%, #0f0c07 100%)",
          border: `1px solid rgba(61,48,32,0.7)`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,151,58,0.03)"
        }}
      >
        {/* Top color accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${c.hex}80, transparent)` }}/>

        {/* Corner glow */}
        <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle at top right, ${c.bg}, transparent 70%)` }} />

        {/* Icon */}
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${c.bg}, rgba(10,8,5,0.4))`,
              border: `1px solid ${c.border}`,
              color: c.hex,
              boxShadow: `0 0 16px ${c.glow}`
            }}>
            {icon}
          </div>
          {difficulty && (
            <span className="text-[10px] font-decorative font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full"
              style={{ background: `${c.bg}`, color: c.hex, border: `1px solid ${c.border}` }}>
              {difficulty}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-decorative font-bold text-sm mb-1.5 transition-colors duration-200 group-hover:text-ark-gold-bright"
            style={{ color: "#e8dcc8" }}>
            {title}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: "#5a4838" }}>{tagline}</p>
        </div>

        {/* Footer detail + arrow */}
        {detail && (
          <div className="flex items-center justify-between pt-2"
            style={{ borderTop: "1px solid rgba(61,48,32,0.5)" }}>
            <span className="text-[10px] font-mono tracking-wider" style={{ color: "#4a3828" }}>{detail}</span>
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="#c9973a" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 8 L13 8 M9 4 L13 8 L9 12"/>
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
}
