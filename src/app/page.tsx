import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import TopicCard from "@/components/learn/TopicCard";

// ── Art Deco Arkham cityscape SVG ──────────────────────────────────────────
function ArkhamSkyline() {
  return (
    <svg viewBox="0 0 800 220" xmlns="http://www.w3.org/2000/svg" className="w-full" aria-hidden="true">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9973a" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#c9973a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d3020" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#1a1410" stopOpacity="1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* Moon */}
      <circle cx="400" cy="60" r="38" fill="none" stroke="#c9973a" strokeWidth="1" strokeDasharray="3 4" opacity="0.35"/>
      <circle cx="400" cy="60" r="30" fill="none" stroke="#c9973a" strokeWidth="0.5" opacity="0.2"/>
      <circle cx="400" cy="60" r="22" fill="rgba(201,151,58,0.06)" stroke="#c9973a" strokeWidth="0.8" opacity="0.4"/>
      {/* Moon crescent detail */}
      <path d="M418 50 A22 22 0 1 1 418 70" fill="none" stroke="#c9973a" strokeWidth="1.2" opacity="0.5"/>

      {/* Stars */}
      {[[90,30],[160,18],[240,40],[320,15],[480,22],[560,35],[640,12],[720,28],[50,55],[750,50]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="#c9973a" opacity={0.3 + (i % 3) * 0.15}/>
      ))}

      {/* Far background buildings */}
      <rect x="0" y="140" width="800" height="80" fill="url(#buildingGrad)" />

      {/* Left cluster */}
      <rect x="20" y="155" width="18" height="65" fill="#2a2010" />
      <rect x="24" y="150" width="10" height="8" fill="#2a2010" />
      <rect x="26" y="145" width="6" height="7" fill="#2a2010" />
      <rect x="42" y="148" width="22" height="72" fill="#221a0e" />
      <rect x="47" y="140" width="12" height="10" fill="#221a0e" />
      <rect x="51" y="135" width="4" height="7" fill="#221a0e" />
      <rect x="68" y="158" width="16" height="62" fill="#2a2010" />

      {/* Left mid buildings */}
      <rect x="90" y="132" width="30" height="88" fill="#1e1810" />
      <rect x="97" y="124" width="16" height="10" fill="#1e1810" />
      <rect x="101" y="116" width="8" height="10" fill="#1e1810" />
      <rect x="103" y="110" width="4" height="8" fill="#c9973a" opacity="0.6"/>
      {/* Windows */}
      <rect x="94" y="140" width="4" height="5" fill="#c9973a" opacity="0.12"/>
      <rect x="101" y="140" width="4" height="5" fill="#c9973a" opacity="0.18"/>
      <rect x="108" y="140" width="4" height="5" fill="#c9973a" opacity="0.08"/>
      <rect x="94" y="152" width="4" height="5" fill="#c9973a" opacity="0.2"/>
      <rect x="108" y="152" width="4" height="5" fill="#c9973a" opacity="0.15"/>

      <rect x="126" y="142" width="24" height="78" fill="#261e0e" />
      <rect x="132" y="135" width="12" height="9" fill="#261e0e" />
      <rect x="136" y="128" width="4" height="9" fill="#261e0e" />
      <rect x="129" y="155" width="4" height="5" fill="#c9973a" opacity="0.1"/>
      <rect x="136" y="155" width="4" height="5" fill="#c9973a" opacity="0.25"/>
      <rect x="143" y="155" width="4" height="5" fill="#c9973a" opacity="0.1"/>

      {/* Miskatonic University tower — left of center */}
      <rect x="165" y="110" width="50" height="110" fill="#1c1608" />
      <rect x="173" y="100" width="34" height="12" fill="#1c1608" />
      <rect x="180" y="90" width="20" height="12" fill="#1c1608" />
      <rect x="185" y="80" width="10" height="12" fill="#1c1608" />
      <rect x="188" y="70" width="4" height="12" fill="#c9973a" opacity="0.8"/>
      {/* Gothic arched windows */}
      <rect x="170" y="118" width="6" height="10" rx="3" fill="#c9973a" opacity="0.15"/>
      <rect x="180" y="118" width="6" height="10" rx="3" fill="#c9973a" opacity="0.3"/>
      <rect x="190" y="118" width="6" height="10" rx="3" fill="#c9973a" opacity="0.15"/>
      <rect x="200" y="118" width="6" height="10" rx="3" fill="#c9973a" opacity="0.2"/>
      <rect x="170" y="135" width="6" height="10" rx="3" fill="#c9973a" opacity="0.1"/>
      <rect x="190" y="135" width="6" height="10" rx="3" fill="#c9973a" opacity="0.25"/>
      <rect x="200" y="135" width="6" height="10" rx="3" fill="#c9973a" opacity="0.1"/>

      {/* Center — Arkham church / clock tower */}
      <rect x="340" y="90" width="120" height="130" fill="#1a1208" />
      <rect x="355" y="78" width="90" height="14" fill="#1a1208" />
      <rect x="370" y="65" width="60" height="15" fill="#1a1208" />
      <rect x="383" y="52" width="34" height="15" fill="#1a1208" />
      <rect x="393" y="38" width="14" height="16" fill="#1a1208" />
      <rect x="398" y="28" width="4" height="12" fill="#c9973a" opacity="0.9" filter="url(#glow)"/>
      {/* Clock face */}
      <circle cx="400" cy="96" r="14" fill="none" stroke="#c9973a" strokeWidth="1.2" opacity="0.5"/>
      <circle cx="400" cy="96" r="1.5" fill="#c9973a" opacity="0.7"/>
      <line x1="400" y1="96" x2="400" y2="86" stroke="#c9973a" strokeWidth="1" opacity="0.6"/>
      <line x1="400" y1="96" x2="408" y2="98" stroke="#c9973a" strokeWidth="1" opacity="0.6"/>
      {/* Arched windows center */}
      <rect x="347" y="100" width="10" height="16" rx="5" fill="#c9973a" opacity="0.2"/>
      <rect x="363" y="100" width="10" height="16" rx="5" fill="#c9973a" opacity="0.35"/>
      <rect x="379" y="100" width="10" height="16" rx="5" fill="#c9973a" opacity="0.15"/>
      <rect x="411" y="100" width="10" height="16" rx="5" fill="#c9973a" opacity="0.15"/>
      <rect x="427" y="100" width="10" height="16" rx="5" fill="#c9973a" opacity="0.3"/>
      <rect x="443" y="100" width="10" height="16" rx="5" fill="#c9973a" opacity="0.2"/>
      <rect x="347" y="125" width="10" height="16" rx="5" fill="#c9973a" opacity="0.1"/>
      <rect x="363" y="125" width="10" height="16" rx="5" fill="#c9973a" opacity="0.2"/>
      <rect x="427" y="125" width="10" height="16" rx="5" fill="#c9973a" opacity="0.1"/>
      <rect x="443" y="125" width="10" height="16" rx="5" fill="#c9973a" opacity="0.25"/>

      {/* Right mid buildings */}
      <rect x="480" y="118" width="46" height="102" fill="#1c1608" />
      <rect x="488" y="108" width="30" height="12" fill="#1c1608" />
      <rect x="494" y="98" width="18" height="12" fill="#1c1608" />
      <rect x="499" y="90" width="8" height="10" fill="#1c1608" />
      <rect x="501" y="83" width="4" height="9" fill="#c9973a" opacity="0.7"/>
      <rect x="484" y="128" width="5" height="8" rx="2.5" fill="#c9973a" opacity="0.2"/>
      <rect x="492" y="128" width="5" height="8" rx="2.5" fill="#c9973a" opacity="0.3"/>
      <rect x="500" y="128" width="5" height="8" rx="2.5" fill="#c9973a" opacity="0.1"/>
      <rect x="508" y="128" width="5" height="8" rx="2.5" fill="#c9973a" opacity="0.25"/>
      <rect x="516" y="128" width="5" height="8" rx="2.5" fill="#c9973a" opacity="0.15"/>

      <rect x="530" y="130" width="34" height="90" fill="#221a0e" />
      <rect x="536" y="122" width="22" height="10" fill="#221a0e" />
      <rect x="541" y="114" width="12" height="10" fill="#221a0e" />
      <rect x="545" y="107" width="4" height="9" fill="#c9973a" opacity="0.6"/>
      <rect x="533" y="142" width="4" height="6" fill="#c9973a" opacity="0.1"/>
      <rect x="540" y="142" width="4" height="6" fill="#c9973a" opacity="0.2"/>
      <rect x="547" y="142" width="4" height="6" fill="#c9973a" opacity="0.1"/>
      <rect x="554" y="142" width="4" height="6" fill="#c9973a" opacity="0.25"/>

      {/* Right cluster */}
      <rect x="572" y="145" width="28" height="75" fill="#1e1810" />
      <rect x="578" y="136" width="16" height="11" fill="#1e1810" />
      <rect x="582" y="128" width="8" height="10" fill="#1e1810" />
      <rect x="575" y="155" width="4" height="5" fill="#c9973a" opacity="0.15"/>
      <rect x="582" y="155" width="4" height="5" fill="#c9973a" opacity="0.1"/>
      <rect x="589" y="155" width="4" height="5" fill="#c9973a" opacity="0.2"/>

      <rect x="604" y="150" width="22" height="70" fill="#2a2010" />
      <rect x="608" y="142" width="14" height="10" fill="#2a2010" />
      <rect x="636" y="155" width="20" height="65" fill="#221a0e" />
      <rect x="640" y="147" width="12" height="10" fill="#221a0e" />
      <rect x="644" y="140" width="4" height="9" fill="#221a0e" />
      <rect x="660" y="158" width="18" height="62" fill="#2a2010" />
      <rect x="680" y="162" width="24" height="58" fill="#1e1810" />
      <rect x="708" y="155" width="16" height="65" fill="#2a2010" />
      <rect x="728" y="148" width="26" height="72" fill="#221a0e" />
      <rect x="733" y="140" width="16" height="10" fill="#221a0e" />
      <rect x="758" y="158" width="20" height="62" fill="#2a2010" />
      <rect x="780" y="163" width="20" height="57" fill="#1e1810" />

      {/* Ground fog */}
      <rect x="0" y="200" width="800" height="20" fill="url(#skyGrad)" opacity="0.5"/>

      {/* Reflection / water glow under buildings */}
      <ellipse cx="400" cy="218" rx="200" ry="6" fill="#c9973a" opacity="0.04"/>
    </svg>
  );
}

const topics = [
  {
    href: "/learn/mythos",
    icon: "🌑",
    title: "Phase 1: Mythos",
    tagline: "Doom accumulates, enemies move, encounter cards strike.",
    color: "purple" as const,
    detail: "Doom · Encounter · Spawn",
    difficulty: "Read first",
  },
  {
    href: "/learn/investigation",
    icon: "🔍",
    title: "Phase 2: Investigation",
    tagline: "Your turn. 3 actions, 10 choices. This is where you play.",
    color: "blue" as const,
    detail: "3 Actions · 10 Options",
    difficulty: "Most important",
  },
  {
    href: "/learn/enemy",
    icon: "👹",
    title: "Phase 3: Enemy",
    tagline: "Enemies hunt you and attack automatically. Brace for impact.",
    color: "red" as const,
    detail: "Hunt · Attack · Aloof",
    difficulty: "Essential",
  },
  {
    href: "/learn/upkeep",
    icon: "🔄",
    title: "Phase 4: Upkeep",
    tagline: "Reset cards, draw, gain resources. Prepare for next round.",
    color: "green" as const,
    detail: "Draw · Resources · Ready",
    difficulty: "Quick read",
  },
  {
    href: "/learn/skill-tests",
    icon: "🎲",
    title: "Skill Tests",
    tagline: "Everything resolves through the same 5-step process.",
    color: "amber" as const,
    detail: "5 Steps · 12 Tokens",
    difficulty: "Critical",
  },
  {
    href: "/learn/damage",
    icon: "💀",
    title: "Damage & Trauma",
    tagline: "How your investigator breaks, survives, and dies.",
    color: "red" as const,
    detail: "HP · Sanity · Defeat",
    difficulty: "Know this",
  },
];

const phases = [
  { label: "Mythos", color: "#7c5cbf", skip: true },
  { label: "Investigation", color: "#4a8fd4" },
  { label: "Enemy", color: "#c0392b" },
  { label: "Upkeep", color: "#3a9e6b" },
];

const startSteps = [
  {
    n: "01",
    title: "Understand the round",
    desc: "Every round follows the same 4-phase loop. Learn what happens in each phase so nothing surprises you.",
    href: "/learn/mythos",
    color: "#7c5cbf",
    tag: "5 min read",
  },
  {
    n: "02",
    title: "Learn your 3 actions",
    desc: "During Investigation phase you get exactly 3 actions. These are the 10 things you can do with them.",
    href: "/learn/investigation",
    color: "#4a8fd4",
    tag: "Core mechanic",
  },
  {
    n: "03",
    title: "Master skill tests",
    desc: "Nearly every action leads to a skill test. It's a 5-step process with a chaos token draw. Learn it once, use it everywhere.",
    href: "/learn/skill-tests",
    color: "#d4922a",
    tag: "Used constantly",
  },
  {
    n: "04",
    title: "Know how investigators die",
    desc: "Damage and horror fill up your health and sanity tracks. When either hits zero, your investigator is in trouble.",
    href: "/learn/damage",
    color: "#c0392b",
    tag: "Don't skip this",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 relative">

        {/* ── Ambient background glows ───────────────────── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full blur-[120px]"
            style={{ background: "radial-gradient(ellipse, rgba(201,151,58,0.05) 0%, transparent 70%)" }} />
          <div className="absolute top-40 right-1/4 w-[500px] h-[400px] rounded-full blur-[140px]"
            style={{ background: "radial-gradient(ellipse, rgba(124,92,191,0.04) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[300px] rounded-full blur-[100px]"
            style={{ background: "radial-gradient(ellipse, rgba(74,143,212,0.03) 0%, transparent 70%)" }} />
        </div>

        <div className="relative" style={{ zIndex: 1 }}>

          {/* ── Hero ─────────────────────────────────────── */}
          <section className="relative overflow-hidden">

            {/* Skyline illustration */}
            <div className="absolute bottom-0 left-0 right-0 opacity-60 pointer-events-none select-none">
              <ArkhamSkyline />
            </div>

            {/* Vignette over skyline */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 100%, transparent 30%, rgba(10,8,5,0.7) 100%)" }} />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-32 text-center">

              {/* Eyebrow badge */}
              <div className="opacity-0 animate-fade-in mb-6">
                <span className="inline-flex items-center gap-2 text-xs font-decorative tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border"
                  style={{ color: "#c9973a", borderColor: "rgba(201,151,58,0.3)", background: "rgba(201,151,58,0.06)" }}>
                  <span className="live-dot" />
                  Arkham Horror: The Card Game — 2026 Edition
                </span>
              </div>

              {/* Title */}
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <h1 className="font-decorative font-bold leading-tight mb-4" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}>
                  <span style={{
                    background: "linear-gradient(135deg, #f0deb0 0%, #c9973a 55%, #8b6914 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                  }}>
                    Your companion for learning
                  </span>
                  <br />
                  <span style={{
                    background: "linear-gradient(135deg, #e8dcc8 0%, #b8a090 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"
                  }}>
                    Arkham Horror 2026.
                  </span>
                </h1>
                <p className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto" style={{ color: "#7a6a58" }}>
                  Pick a topic and start reading. Every mechanic explained step by step — no assumed knowledge.
                </p>
              </div>

              {/* Round structure strip */}
              <div className="opacity-0 animate-slide-up mt-8" style={{ animationDelay: "0.2s" }}>
                <div className="inline-flex flex-wrap justify-center items-center gap-1 px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(16,12,8,0.85)", border: "1px solid rgba(61,48,32,0.8)", backdropFilter: "blur(8px)" }}>
                  <span className="text-[10px] font-decorative text-ark-text-muted tracking-[0.15em] uppercase mr-2">Each round:</span>
                  {phases.map((p, i) => (
                    <div key={p.label} className="flex items-center gap-1">
                      {p.skip && i === 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: "rgba(124,92,191,0.15)", color: "#7c5cbf", border: "1px solid rgba(124,92,191,0.25)" }}>
                          skip R1
                        </span>
                      )}
                      <span className="text-xs font-semibold font-decorative" style={{ color: p.color }}>{p.label}</span>
                      {i < phases.length - 1 && <span className="text-ark-text-muted text-xs mx-0.5">→</span>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ── Start Here ────────────────────────────────── */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">

            {/* Section heading */}
            <div className="opacity-0 animate-slide-up mb-8" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.3))" }} />
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                  style={{ background: "rgba(201,151,58,0.06)", border: "1px solid rgba(201,151,58,0.2)" }}>
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="#c9973a" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M8 1 L8 15 M1 8 L8 1 L15 8" />
                  </svg>
                  <span className="text-xs font-decorative tracking-[0.15em] uppercase" style={{ color: "#c9973a" }}>
                    New? Start Here
                  </span>
                </div>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(201,151,58,0.3), transparent)" }} />
              </div>
            </div>

            {/* 4 step cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {startSteps.map((step, i) => (
                <Link key={step.href} href={step.href} className="group block opacity-0 animate-slide-up"
                  style={{ animationDelay: `${0.35 + i * 0.07}s` }}>
                  <div className="relative h-full rounded-xl p-5 flex gap-4 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "linear-gradient(135deg, #161008 0%, #0f0c07 100%)",
                      border: `1px solid rgba(61,48,32,0.7)`,
                      boxShadow: "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,151,58,0.04)"
                    }}>
                    {/* Step number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-decorative font-bold text-sm"
                      style={{
                        background: `linear-gradient(135deg, ${step.color}18, ${step.color}08)`,
                        border: `1px solid ${step.color}40`,
                        color: step.color,
                        boxShadow: `0 0 16px ${step.color}20`
                      }}>
                      {step.n}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-decorative font-semibold text-sm leading-snug transition-colors group-hover:text-ark-gold-bright"
                          style={{ color: "#e8dcc8" }}>
                          {step.title}
                        </h3>
                        <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: `${step.color}18`, color: step.color, border: `1px solid ${step.color}30` }}>
                          {step.tag}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#5a4a38" }}>{step.desc}</p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="#c9973a" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M3 8 L13 8 M9 4 L13 8 L9 12"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

          </section>

          {/* ── Divider ───────────────────────────────────── */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
            <div className="deco-divider deco-divider-gold">
              <span className="text-xs font-decorative tracking-widest text-ark-text-muted uppercase">All Topics</span>
            </div>
          </div>

          {/* ── Topic grid ───────────────────────────────── */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic, i) => (
                <TopicCard key={topic.href} {...topic} delay={i + 1} />
              ))}
            </div>
          </section>

          {/* ── 5 Investigators quick reference ──────────── */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-14">
            <div className="rounded-2xl p-6 sm:p-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #141008 0%, #0c0905 100%)", border: "1px solid #3d3020" }}>

              {/* BG texture */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(201,151,58,0.04) 0%, transparent 60%)" }}/>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.25)" }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#c9973a" strokeWidth="1.7" strokeLinecap="round">
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/>
                      <circle cx="19" cy="7" r="3"/>
                      <path d="M22 21v-1.5a3 3 0 00-3-3"/>
                    </svg>
                  </div>
                  <h2 className="font-decorative font-bold text-base" style={{ color: "#e8dcc8" }}>
                    The 5 Investigators
                  </h2>
                  <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(93,74,40,0.6), transparent)" }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[
                    { name: "Daniela Reyes", class: "Guardian", color: "#4a8fd4", hp: 9, san: 5, stats: "Will 3 · Int 2 · Com 5 · Agi 2" },
                    { name: "Joe Diamond", class: "Seeker", color: "#d4922a", hp: 7, san: 7, stats: "Will 2 · Int 4 · Com 4 · Agi 2" },
                    { name: "Trish Scarborough", class: "Rogue", color: "#3a9e6b", hp: 8, san: 6, stats: "Will 2 · Int 4 · Com 2 · Agi 4" },
                    { name: "Dexter Drake", class: "Mystic", color: "#7c5cbf", hp: 6, san: 8, stats: "Will 5 · Int 2 · Com 2 · Agi 3" },
                    { name: "Isabelle Barnes", class: "Survivor", color: "#c0392b", hp: 9, san: 5, stats: "Will 4 · Int 2 · Com 3 · Agi 3" },
                  ].map((inv) => (
                    <div key={inv.name} className="rounded-xl p-4 flex flex-col gap-2"
                      style={{
                        background: `linear-gradient(135deg, ${inv.color}0d, rgba(10,8,5,0.6))`,
                        border: `1px solid ${inv.color}30`
                      }}>
                      {/* Class badge */}
                      <div className="text-[10px] font-decorative font-semibold tracking-widest uppercase" style={{ color: inv.color }}>
                        {inv.class}
                      </div>
                      {/* Name */}
                      <div className="font-display text-xs font-semibold leading-tight" style={{ color: "#e8dcc8" }}>
                        {inv.name}
                      </div>
                      {/* Stats */}
                      <div className="text-[10px] leading-relaxed" style={{ color: "#5a4838" }}>
                        {inv.stats}
                      </div>
                      {/* HP / Sanity */}
                      <div className="flex gap-2 mt-auto pt-1">
                        <div className="flex items-center gap-1">
                          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="#c0392b" strokeWidth="1.5">
                            <path d="M6 10 C6 10 1 7 1 4 a2.5 2.5 0 015 0 2.5 2.5 0 015 0 c0 3-5 6-5 6z"/>
                          </svg>
                          <span className="text-[11px] font-mono font-semibold" style={{ color: "#c0392b" }}>{inv.hp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="#7c5cbf" strokeWidth="1.5">
                            <path d="M10 6 A5 5 0 1 1 6 1 A3.5 3.5 0 0 0 10 6z"/>
                          </svg>
                          <span className="text-[11px] font-mono font-semibold" style={{ color: "#7c5cbf" }}>{inv.san}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ── Play CTA ─────────────────────────────────── */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
            <Link href="/play" className="group block">
              <div className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                style={{ border: "1px solid #3d3020", background: "linear-gradient(135deg, #1a1410 0%, #120e09 100%)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(201,151,58,0.05) 0%, transparent 60%)" }} />
                {/* Top gold line */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.4), transparent)" }}/>
                <div className="relative flex flex-col sm:flex-row items-center gap-5 p-6 sm:p-8">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.25)" }}>
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#c9973a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <path d="M8 21 L16 21 M12 17 L12 21"/>
                      <circle cx="12" cy="10" r="3"/>
                      <path d="M9 10 h1 M14 10 h1"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-decorative font-bold text-xl mb-1" style={{ color: "#e8dcc8" }}>
                      Ready to play?
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "#6b5840" }}>
                      Track damage, horror, and resources for your whole group. Share a session code — everyone syncs in real time.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold font-decorative transition-all group-hover:brightness-110"
                      style={{ background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#0a0805",
                        boxShadow: "0 2px 12px rgba(201,151,58,0.3)" }}>
                      Open Play
                      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M3 8 L13 8 M9 4 L13 8 L9 12"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </section>

        </div>
      </main>
    </>
  );
}
