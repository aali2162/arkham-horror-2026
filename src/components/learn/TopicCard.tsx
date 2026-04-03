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
  blue:   { hex: "#4a8fd4", bg: "rgba(74,143,212,0.08)",   border: "rgba(74,143,212,0.25)",  topBar: "#4a8fd4" },
  green:  { hex: "#2e8a50", bg: "rgba(46,138,80,0.08)",    border: "rgba(46,138,80,0.25)",   topBar: "#2e8a50" },
  red:    { hex: "#b82020", bg: "rgba(184,32,32,0.08)",    border: "rgba(184,32,32,0.25)",   topBar: "#b82020" },
  purple: { hex: "#7050b8", bg: "rgba(112,80,184,0.08)",   border: "rgba(112,80,184,0.25)",  topBar: "#7050b8" },
  amber:  { hex: "#c8871a", bg: "rgba(200,135,26,0.08)",   border: "rgba(200,135,26,0.25)",  topBar: "#c8871a" },
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
        className="h-full rounded-xl flex flex-col transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5"
        style={{
          background: "#ecdcb0",
          border: `1px solid #c8a860`,
          boxShadow: "0 3px 14px rgba(90,58,8,0.10), inset 0 1px 0 rgba(255,248,200,0.7)"
        }}
      >
        {/* Top colour accent bar */}
        <div className="h-[3px] w-full flex-shrink-0"
          style={{ background: `linear-gradient(90deg, ${c.topBar}cc, ${c.topBar}55, transparent)` }} />

        <div className="p-5 flex flex-col gap-3 flex-1">
          {/* Icon row */}
          <div className="flex items-start justify-between">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105"
              style={{
                background: c.bg,
                border: `1.5px solid ${c.border}`,
                color: c.hex,
              }}>
              {icon}
            </div>
            {difficulty && (
              <span className="text-[10px] font-heading font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full"
                style={{ background: c.bg, color: c.hex, border: `1px solid ${c.border}` }}>
                {difficulty}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-heading font-bold text-sm mb-1.5 transition-colors duration-200"
              style={{ color: "#2a1808" }}>
              {title}
            </h3>
            <p className="text-xs leading-relaxed font-body" style={{ color: "#6a5030" }}>{tagline}</p>
          </div>

          {/* Footer detail + arrow */}
          {detail && (
            <div className="flex items-center justify-between pt-2.5"
              style={{ borderTop: "1px solid rgba(138,104,32,0.2)" }}>
              <span className="text-[10px] font-mono tracking-wider" style={{ color: "#8a7040" }}>{detail}</span>
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="#8a6820" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 8 L13 8 M9 4 L13 8 L9 12"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
