"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none"
      stroke={active ? "#0a0805" : "currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17.5A2 2 0 016 15.5H16"/>
      <path d="M6 2H16v15.5H6A2 2 0 014 15.5V4A2 2 0 016 2z"/>
      <line x1="8" y1="7" x2="13" y2="7"/>
      <line x1="8" y1="10" x2="11" y2="10"/>
    </svg>
  );
}

function PlayIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none"
      stroke={active ? "#0a0805" : "currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="16" height="12" rx="2"/>
      <circle cx="10" cy="9" r="2.5"/>
      <path d="M7 9 h0.5 M12.5 9 h0.5"/>
      <path d="M6 17.5 L14 17.5 M10 15 L10 17.5"/>
    </svg>
  );
}

// Game Train logo mark — stylised "GT" monogram
function GameTrainLogo() {
  return (
    <svg viewBox="0 0 36 36" className="w-9 h-9" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer square with rounded corners */}
      <rect x="3" y="3" width="30" height="30" rx="7"
        stroke="#c9973a" strokeWidth="1" strokeOpacity="0.5" fill="rgba(201,151,58,0.05)"/>
      {/* G */}
      <text x="5" y="25" fontFamily="serif" fontSize="18" fontWeight="700"
        fill="url(#gtGrad)" opacity="0.9">G</text>
      {/* T */}
      <text x="18" y="25" fontFamily="serif" fontSize="18" fontWeight="700"
        fill="url(#gtGrad)" opacity="0.9">T</text>
      <defs>
        <linearGradient id="gtGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8dcc8"/>
          <stop offset="100%" stopColor="#c9973a"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isPlay = pathname.startsWith("/play");
  const isLearn = pathname.startsWith("/learn") || pathname === "/";

  return (
    <nav className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(10, 8, 5, 0.95)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(61,48,32,0.5)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)"
      }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <GameTrainLogo />
            <div className="flex flex-col leading-tight">
              <span className="font-sans font-bold text-sm tracking-wide"
                style={{
                  background: "linear-gradient(135deg, #e8dcc8 0%, #c9973a 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                }}>
                Game Train
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] font-medium" style={{ color: "#6b5840" }}>
                Arkham Horror · 2026
              </span>
            </div>
          </Link>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "rgba(20,16,10,0.8)", border: "1px solid rgba(61,48,32,0.6)" }}>
            <NavTab href="/" label="Learn" active={isLearn} icon={<LearnIcon active={isLearn}/>} />
            <NavTab href="/play" label="Play" active={isPlay} icon={<PlayIcon active={isPlay}/>} />
          </div>

        </div>
      </div>

      {/* Bottom gold shimmer line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.3), transparent)"
      }} />
    </nav>
  );
}

function NavTab({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: React.ReactNode }) {
  return (
    <Link href={href}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 font-sans tracking-wide ${
        active ? "text-[#0a0805]" : "text-ark-text-muted hover:text-ark-text"
      }`}
      style={active ? {
        background: "linear-gradient(135deg, #c9973a, #a07828)",
        boxShadow: "0 2px 10px rgba(201,151,58,0.35)"
      } : {}}>
      {icon}
      {label}
    </Link>
  );
}
