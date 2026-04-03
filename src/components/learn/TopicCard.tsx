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
        className="h-full rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1a1410 0%, #120e09 100%)",
          border: `1px solid #3d3020`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,151,58,0.04)"
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = c.border;
          el.style.boxShadow = `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${c.glow}, inset 0 1px 0 ${c.glow}`;
          el.style.transform = "translateY(-3px)";
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "#3d3020";
          el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,151,58,0.04)";
          el.style.transform = "translateY(0)";
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
          <h3 className="font-decorative font-bold text-base text-ark-text mb-1.5 group-hover:text-ark-gold-bright transition-colors"
            style={{ color: "#e8dcc8" }}>
            {title}
          </h3>
          <p className="text-ark-text-muted text-sm leading-relaxed">{tagline}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "#2e2318" }}>
          {detail && (
            <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: c.hex }}>
              {detail}
            </span>
          )}
          <span className="text-xs font-semibold flex items-center gap-1 ml-auto transition-all duration-200 group-hover:gap-2"
            style={{ color: c.hex }}>
            Read more <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
