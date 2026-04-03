"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function LearnIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none"
      stroke={active ? "#f0e4c0" : "#8a7040"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
      stroke={active ? "#f0e4c0" : "#8a7040"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7"/>
      <circle cx="10" cy="10" r="3"/>
      <line x1="10" y1="3" x2="10" y2="4.5"/>
      <line x1="10" y1="15.5" x2="10" y2="17"/>
      <line x1="3" y1="10" x2="4.5" y2="10"/>
      <line x1="15.5" y1="10" x2="17" y2="10"/>
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const isPlay = pathname.startsWith("/play");
  const isLearn = pathname.startsWith("/learn") || pathname === "/";

  return (
    <nav className="sticky top-0 z-50"
      style={{
        background: "#e0d0a0",
        borderBottom: "2px solid #b89848",
        boxShadow: "0 2px 12px rgba(90,58,8,0.12)",
      }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link href="/" className="flex flex-col leading-tight group">
            <span className="font-heading font-bold text-[11px] tracking-[3px]"
              style={{ color: "#5a3a08" }}>
              GAME TRAIN
            </span>
            <span className="font-body italic text-[9px]" style={{ color: "#9a8050" }}>
              Arkham Horror
            </span>
          </Link>

          {/* Nav tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "rgba(90,58,8,0.08)", border: "1px solid #c8a860" }}>
            <NavTab href="/" label="Learn" active={isLearn} icon={<LearnIcon active={isLearn} />} />
            <NavTab href="/play" label="Play" active={isPlay} icon={<PlayIcon active={isPlay} />} />
          </div>

        </div>
      </div>

      {/* Bottom shimmer line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(184,152,72,0.6), transparent)",
      }} />
    </nav>
  );
}

function NavTab({ href, label, active, icon }: { href: string; label: string; active: boolean; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 flex items-center gap-2 font-heading"
      style={active ? {
        background: "#2a1808",
        color: "#f0e4c0",
        boxShadow: "0 2px 8px rgba(30,10,0,0.25)",
      } : {
        color: "#8a7040",
      }}>
      {icon}
      {label}
    </Link>
  );
}
