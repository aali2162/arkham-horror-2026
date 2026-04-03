"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PHASES = [
  { id: "mythos",        number: 1, label: "Mythos",        icon: "🌑", href: "/learn/mythos",        color: "purple" },
  { id: "investigation", number: 2, label: "Investigation", icon: "🔍", href: "/learn/investigation",  color: "blue"   },
  { id: "enemy",        number: 3, label: "Enemy",         icon: "👹", href: "/learn/enemy",          color: "red"    },
  { id: "upkeep",       number: 4, label: "Upkeep",        icon: "🔄", href: "/learn/upkeep",         color: "green"  },
];

const COLOR_MAP: Record<string, { active: string; dot: string }> = {
  purple: { active: "bg-ark-purple/20 border-ark-purple/50 text-ark-purple",      dot: "bg-ark-purple" },
  blue:   { active: "bg-ark-blue/20 border-ark-blue/50 text-ark-blue",             dot: "bg-ark-blue"   },
  red:    { active: "bg-ark-red/20 border-ark-red/50 text-ark-red",                dot: "bg-ark-red"    },
  green:  { active: "bg-ark-green/20 border-ark-green/50 text-ark-green",          dot: "bg-ark-green"  },
};

export default function PhaseNav() {
  const pathname = usePathname();

  // Determine which phase is currently active
  const currentPhase = PHASES.find((p) =>
    pathname === p.href || pathname.startsWith(p.href + "/")
  );

  return (
    <div className="mb-8">
      {/* Label */}
      <p className="text-ark-text-muted text-xs font-mono uppercase tracking-widest mb-3 text-center">
        Round Phases — tap to jump
      </p>

      {/* Phase tabs */}
      <div className="grid grid-cols-4 gap-2">
        {PHASES.map((phase, i) => {
          const isActive = currentPhase?.id === phase.id;
          const colors = COLOR_MAP[phase.color];

          return (
            <Link
              key={phase.id}
              href={phase.href}
              className={`
                relative flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border
                transition-all duration-200 text-center group
                ${isActive
                  ? `${colors.active} shadow-lg`
                  : "bg-ark-surface border-ark-border text-ark-text-muted hover:text-ark-text hover:border-ark-border-gold hover:bg-ark-card"
                }
              `}
            >
              {/* Phase number badge */}
              <span
                className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border ${
                  isActive
                    ? `${colors.dot} text-ark-bg border-transparent`
                    : "bg-ark-bg border-ark-border text-ark-text-muted"
                }`}
              >
                {phase.number}
              </span>

              <span className="text-xl leading-none mt-1">{phase.icon}</span>
              <span className={`text-[10px] font-semibold font-mono uppercase tracking-wide leading-tight ${
                isActive ? "" : "group-hover:text-ark-text"
              }`}>
                {phase.label}
              </span>

              {/* Active indicator line */}
              {isActive && (
                <span className={`absolute bottom-0 left-1/4 right-1/4 h-0.5 rounded-full ${colors.dot} opacity-80`} />
              )}
            </Link>
          );
        })}
      </div>

      {/* Flow arrow connecting them — visual hint */}
      <div className="flex items-center justify-center gap-1 mt-3">
        {PHASES.map((phase, i) => (
          <span key={phase.id} className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                currentPhase?.id === phase.id
                  ? COLOR_MAP[phase.color].dot + " opacity-100 scale-125"
                  : "bg-ark-border opacity-50"
              }`}
            />
            {i < PHASES.length - 1 && (
              <span className="text-ark-text-muted text-xs opacity-40">›</span>
            )}
          </span>
        ))}
        <span className="text-ark-text-muted text-xs opacity-40 ml-1">↺</span>
      </div>
    </div>
  );
}
