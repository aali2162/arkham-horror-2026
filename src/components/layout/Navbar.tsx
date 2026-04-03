"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isPlay = pathname.startsWith("/play");
  const isLearn = pathname.startsWith("/learn") || pathname === "/";

  return (
    <nav className="sticky top-0 z-50 border-b border-ark-border" style={{
      background: "rgba(10, 8, 5, 0.92)",
      backdropFilter: "blur(20px)",
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)"
    }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-ark-border-gold/40"
              style={{ background: "linear-gradient(135deg, rgba(201,151,58,0.12), rgba(10,8,5,0.8))" }}>
              <span className="text-xl leading-none">🔮</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-decorative font-bold text-sm tracking-wide"
                style={{ background: "linear-gradient(135deg, #e8dcc8, #c9973a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Arkham Horror
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-ark-text-muted font-medium">
                2026 · Learning Companion
              </span>
            </div>
          </Link>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg"
            style={{ background: "rgba(26, 20, 16, 0.8)", border: "1px solid #3d3020" }}>
            <NavTab href="/" label="Learn" icon="📖" active={isLearn} />
            <NavTab href="/play" label="Play" icon="🎮" active={isPlay} />
          </div>

        </div>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.35), transparent)" }} />
    </nav>
  );
}

function NavTab({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return (
    <Link href={href}
      className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${active ? "text-[#0a0805]" : "text-ark-text-muted hover:text-ark-text"}`}
      style={active ? { background: "linear-gradient(135deg, #c9973a, #a07828)", boxShadow: "0 2px 8px rgba(201,151,58,0.3)" } : {}}>
      <span className="text-base leading-none">{icon}</span>
      <span className="font-decorative tracking-wide">{label}</span>
    </Link>
  );
}
