"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isPlay = pathname.startsWith("/play");
  const isLearn = pathname.startsWith("/learn") || pathname === "/";

  return (
    <nav className="sticky top-0 z-50 bg-ark-bg/80 backdrop-blur-xl border-b border-ark-border">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl">🔮</span>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-ark-text text-base tracking-wide group-hover:text-ark-blue transition-colors">
                Arkham Horror
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-ark-text-muted font-medium">
                2026 Learning Companion
              </span>
            </div>
          </Link>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-ark-surface rounded-lg p-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                isLearn
                  ? "bg-ark-blue text-white shadow-md"
                  : "text-ark-text-dim hover:text-ark-text"
              }`}
            >
              📖 Learn
            </Link>
            <Link
              href="/play"
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                isPlay
                  ? "bg-ark-blue text-white shadow-md"
                  : "text-ark-text-dim hover:text-ark-text"
              }`}
            >
              🎮 Play
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
