import Link from "next/link";

interface TopicCardProps {
  href: string;
  icon: string;
  title: string;
  tagline: string;
  color: "blue" | "green" | "red" | "purple" | "amber";
  delay?: number;
}

const colorMap = {
  blue: "hover:border-ark-blue/50 glow-blue",
  green: "hover:border-ark-green/50 glow-green",
  red: "hover:border-red-500/50 glow-red",
  purple: "hover:border-ark-purple/50 glow-purple",
  amber: "hover:border-ark-amber/50",
};

const accentMap = {
  blue: "bg-ark-blue/10 text-ark-blue",
  green: "bg-ark-green/10 text-ark-green",
  red: "bg-red-500/10 text-ark-red",
  purple: "bg-ark-purple/10 text-ark-purple",
  amber: "bg-ark-amber/10 text-ark-amber",
};

export default function TopicCard({ href, icon, title, tagline, color, delay = 0 }: TopicCardProps) {
  return (
    <Link
      href={href}
      className={`card p-6 flex flex-col gap-3 opacity-0 animate-slide-up ${colorMap[color]}`}
      style={{ animationDelay: `${delay * 0.07}s` }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${accentMap[color]}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-display font-bold text-lg text-ark-text mb-1">{title}</h3>
        <p className="text-ark-text-dim text-sm leading-relaxed">{tagline}</p>
      </div>
      <div className="mt-auto pt-2">
        <span className="text-ark-blue text-sm font-semibold flex items-center gap-1">
          Learn more <span className="text-xs">→</span>
        </span>
      </div>
    </Link>
  );
}
