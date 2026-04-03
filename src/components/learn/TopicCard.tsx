import Link from "next/link";

interface TopicCardProps {
  href: string;
  icon: string;
  title: string;
  tagline: string;
  color: "blue" | "green" | "red" | "purple" | "amber";
  detail?: string;
  delay?: number;
}

const colorConfig = {
  blue:   { hex: "#4a8fd4", glow: "rgba(74,143,212,0.15)",   bg: "rgba(74,143,212,0.06)",   border: "rgba(74,143,212,0.35)"  },
  green:  { hex: "#3a9e6b", glow: "rgba(58,158,107,0.15)",   bg: "rgba(58,158,107,0.06)",   border: "rgba(58,158,107,0.35)"  },
  red:    { hex: "#c0392b", glow: "rgba(192,57,43,0.18)",     bg: "rgba(192,57,43,0.07)",    border: "rgba(192,57,43,0.35)"   },
  purple: { hex: "#7c5cbf", glow: "rgba(124,92,191,0.18)",   bg: "rgba(124,92,191,0.07)",   border: "rgba(124,92,191,0.35)"  },
  amber:  { hex: "#d4922a", glow: "rgba(212,146,42,0.18)",   bg: "rgba(212,146,42,0.07)",   border: "rgba(212,146,42,0.35)"  },
};

export default function TopicCard({ href, icon, title, tagline, color, detail, delay = 0 }: TopicCardProps) {
  const c = colorConfig[color];

  return (
    <Link
      href={href}
      className="group block opacity-0 animate-slide-up"
      style={{ animationDelay: `${delay * 0.07}s` }}
    >
      <div
        className="h-full rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #1a1410 0%, #120e09 100%)",
          border: `1px solid #3d3020`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,151,58,0.04)"
        }}
      >
        {/* Corner ornament */}
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-30"
          style={{ background: `radial-gradient(circle at top right, ${c.bg}, transparent 70%)` }} />

        {/* Icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          style={{ background: c.bg, border: `1px solid ${c.border}`, boxShadow: `0 0 12px ${c.glow}` }}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-decorative font-bold text-base mb-1.5 transition-colors"
            style={{ color: "#e8dcc8" }}>
            {title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#7a6a58" }}>{tagline}</p>
          {detail && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "#5a4a38" }}>{detail}</p>
          )}
        </div>

        {/* Bottom accent */}
        <div className="h-px w-full mt-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(90deg, transparent, ${c.border}, transparent)` }} />
      </div>
    </Link>
  );
}
