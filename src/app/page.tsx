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
          <stop offset="0%" stopColor="#8a6820" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#8a6820" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a3a08" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#3a2008" stopOpacity="0.75" />
        </linearGradient>
      </defs>

      {/* Moon */}
      <circle cx="400" cy="60" r="38" fill="none" stroke="#8a6820" strokeWidth="1" strokeDasharray="3 4" opacity="0.3"/>
      <circle cx="400" cy="60" r="30" fill="none" stroke="#8a6820" strokeWidth="0.5" opacity="0.18"/>
      <circle cx="400" cy="60" r="22" fill="rgba(138,104,32,0.06)" stroke="#8a6820" strokeWidth="0.8" opacity="0.35"/>
      <path d="M418 50 A22 22 0 1 1 418 70" fill="none" stroke="#8a6820" strokeWidth="1.2" opacity="0.4"/>

      {/* Stars */}
      {[[90,30],[160,18],[240,40],[320,15],[480,22],[560,35],[640,12],[720,28],[50,55],[750,50]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="#8a6820" opacity={0.2 + (i % 3) * 0.12}/>
      ))}

      {/* Ground */}
      <rect x="0" y="140" width="800" height="80" fill="url(#buildingGrad)" />

      {/* Left cluster */}
      <rect x="20" y="155" width="18" height="65" fill="#5a3808" opacity="0.5"/>
      <rect x="24" y="150" width="10" height="8" fill="#5a3808" opacity="0.5"/>
      <rect x="26" y="145" width="6" height="7" fill="#5a3808" opacity="0.5"/>
      <rect x="42" y="148" width="22" height="72" fill="#4a3008" opacity="0.5"/>
      <rect x="47" y="140" width="12" height="10" fill="#4a3008" opacity="0.5"/>
      <rect x="68" y="158" width="16" height="62" fill="#5a3808" opacity="0.5"/>

      {/* Left mid buildings */}
      <rect x="90" y="132" width="30" height="88" fill="#3e2a08" opacity="0.55"/>
      <rect x="97" y="124" width="16" height="10" fill="#3e2a08" opacity="0.55"/>
      <rect x="101" y="116" width="8" height="10" fill="#3e2a08" opacity="0.55"/>
      <rect x="103" y="110" width="4" height="8" fill="#8a6820" opacity="0.5"/>
      {/* Windows */}
      <rect x="94" y="140" width="4" height="5" fill="#8a6820" opacity="0.12"/>
      <rect x="101" y="140" width="4" height="5" fill="#8a6820" opacity="0.18"/>
      <rect x="108" y="140" width="4" height="5" fill="#8a6820" opacity="0.1"/>
      <rect x="94" y="152" width="4" height="5" fill="#8a6820" opacity="0.2"/>
      <rect x="108" y="152" width="4" height="5" fill="#8a6820" opacity="0.14"/>

      <rect x="126" y="142" width="24" height="78" fill="#4a3010" opacity="0.5"/>
      <rect x="132" y="135" width="12" height="9" fill="#4a3010" opacity="0.5"/>
      <rect x="129" y="155" width="4" height="5" fill="#8a6820" opacity="0.1"/>
      <rect x="136" y="155" width="4" height="5" fill="#8a6820" opacity="0.22"/>

      {/* Miskatonic University tower */}
      <rect x="165" y="110" width="50" height="110" fill="#382208" opacity="0.55"/>
      <rect x="173" y="100" width="34" height="12" fill="#382208" opacity="0.55"/>
      <rect x="180" y="90" width="20" height="12" fill="#382208" opacity="0.55"/>
      <rect x="185" y="80" width="10" height="12" fill="#382208" opacity="0.55"/>
      <rect x="188" y="70" width="4" height="12" fill="#8a6820" opacity="0.6"/>
      <rect x="170" y="118" width="6" height="10" rx="3" fill="#8a6820" opacity="0.15"/>
      <rect x="180" y="118" width="6" height="10" rx="3" fill="#8a6820" opacity="0.28"/>
      <rect x="190" y="118" width="6" height="10" rx="3" fill="#8a6820" opacity="0.12"/>
      <rect x="200" y="118" width="6" height="10" rx="3" fill="#8a6820" opacity="0.2"/>

      {/* Center — Arkham church / clock tower */}
      <rect x="340" y="90" width="120" height="130" fill="#2e1a06" opacity="0.6"/>
      <rect x="355" y="78" width="90" height="14" fill="#2e1a06" opacity="0.6"/>
      <rect x="370" y="65" width="60" height="15" fill="#2e1a06" opacity="0.6"/>
      <rect x="383" y="52" width="34" height="15" fill="#2e1a06" opacity="0.6"/>
      <rect x="393" y="38" width="14" height="16" fill="#2e1a06" opacity="0.6"/>
      <rect x="398" y="28" width="4" height="12" fill="#8a6820" opacity="0.8"/>
      {/* Clock face */}
      <circle cx="400" cy="96" r="14" fill="none" stroke="#8a6820" strokeWidth="1.2" opacity="0.45"/>
      <circle cx="400" cy="96" r="1.5" fill="#8a6820" opacity="0.6"/>
      <line x1="400" y1="96" x2="400" y2="86" stroke="#8a6820" strokeWidth="1" opacity="0.5"/>
      <line x1="400" y1="96" x2="408" y2="98" stroke="#8a6820" strokeWidth="1" opacity="0.5"/>
      {/* Arched windows center */}
      <rect x="347" y="100" width="10" height="16" rx="5" fill="#8a6820" opacity="0.18"/>
      <rect x="363" y="100" width="10" height="16" rx="5" fill="#8a6820" opacity="0.3"/>
      <rect x="379" y="100" width="10" height="16" rx="5" fill="#8a6820" opacity="0.12"/>
      <rect x="411" y="100" width="10" height="16" rx="5" fill="#8a6820" opacity="0.12"/>
      <rect x="427" y="100" width="10" height="16" rx="5" fill="#8a6820" opacity="0.28"/>
      <rect x="443" y="100" width="10" height="16" rx="5" fill="#8a6820" opacity="0.18"/>

      {/* Right mid buildings */}
      <rect x="480" y="118" width="46" height="102" fill="#382208" opacity="0.52"/>
      <rect x="488" y="108" width="30" height="12" fill="#382208" opacity="0.52"/>
      <rect x="499" y="90" width="8" height="10" fill="#382208" opacity="0.52"/>
      <rect x="501" y="83" width="4" height="9" fill="#8a6820" opacity="0.55"/>
      <rect x="492" y="128" width="5" height="8" rx="2.5" fill="#8a6820" opacity="0.25"/>
      <rect x="500" y="128" width="5" height="8" rx="2.5" fill="#8a6820" opacity="0.12"/>
      <rect x="508" y="128" width="5" height="8" rx="2.5" fill="#8a6820" opacity="0.2"/>

      <rect x="530" y="130" width="34" height="90" fill="#4a2e0a" opacity="0.5"/>
      <rect x="536" y="122" width="22" height="10" fill="#4a2e0a" opacity="0.5"/>
      <rect x="545" y="107" width="4" height="9" fill="#8a6820" opacity="0.5"/>
      <rect x="540" y="142" width="4" height="6" fill="#8a6820" opacity="0.18"/>
      <rect x="547" y="142" width="4" height="6" fill="#8a6820" opacity="0.1"/>

      {/* Right cluster */}
      <rect x="572" y="145" width="28" height="75" fill="#3e2808" opacity="0.5"/>
      <rect x="578" y="136" width="16" height="11" fill="#3e2808" opacity="0.5"/>
      <rect x="589" y="155" width="4" height="5" fill="#8a6820" opacity="0.18"/>
      <rect x="604" y="150" width="22" height="70" fill="#5a3808" opacity="0.45"/>
      <rect x="636" y="155" width="20" height="65" fill="#4a2e0a" opacity="0.45"/>
      <rect x="660" y="158" width="18" height="62" fill="#5a3808" opacity="0.45"/>
      <rect x="680" y="162" width="24" height="58" fill="#3e2808" opacity="0.45"/>
      <rect x="708" y="155" width="16" height="65" fill="#5a3808" opacity="0.45"/>
      <rect x="728" y="148" width="26" height="72" fill="#4a2e0a" opacity="0.45"/>
      <rect x="758" y="158" width="20" height="62" fill="#5a3808" opacity="0.45"/>
      <rect x="780" y="163" width="20" height="57" fill="#3e2808" opacity="0.45"/>

      {/* Ground fog */}
      <rect x="0" y="200" width="800" height="20" fill="url(#skyGrad)" opacity="0.4"/>
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
  { label: "Mythos", color: "#7050b8", skip: true },
  { label: "Investigation", color: "#4a8fd4" },
  { label: "Enemy", color: "#b82020" },
  { label: "Upkeep", color: "#2e8a50" },
];

const startSteps = [
  {
    n: "01",
    title: "Understand the round",
    desc: "Every round follows the same 4-phase loop. Learn what happens in each phase so nothing surprises you.",
    href: "/learn/mythos",
    color: "#7050b8",
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
    color: "#c8871a",
    tag: "Used constantly",
  },
  {
    n: "04",
    title: "Know how investigators die",
    desc: "Damage and horror fill up your health and sanity tracks. When either hits zero, your investigator is in trouble.",
    href: "/learn/damage",
    color: "#b82020",
    tag: "Don't skip this",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 relative">

        <div className="relative" style={{ zIndex: 1 }}>

          {/* ── Hero ─────────────────────────────────────── */}
          <section className="relative overflow-hidden">

            {/* Skyline illustration */}
            <div className="absolute bottom-0 left-0 right-0 opacity-40 pointer-events-none select-none">
              <ArkhamSkyline />
            </div>

            {/* Subtle vignette over skyline */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 100%, transparent 30%, rgba(242,232,204,0.85) 85%)" }} />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-28 text-center">

              {/* Ornament band / platform label */}
              <div className="opacity-0 animate-fade-in mb-5">
                <span className="inline-flex items-center gap-2 text-[10px] font-heading font-semibold tracking-[0.25em] uppercase px-4 py-1.5 rounded-full"
                  style={{ color: "#6a5030", border: "1px solid #c8a860", background: "rgba(236,220,176,0.8)" }}>
                  ✦ Game Train — Interactive Board Game Companion ✦
                </span>
              </div>

              {/* Game title */}
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <p className="text-xs font-heading font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: "#8a7040" }}>Now available</p>
                <h1 className="font-title font-bold leading-tight mb-3" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", color: "#2a1808" }}>
                  Arkham Horror
                </h1>
                <p className="text-sm font-heading font-medium mb-3 tracking-widest uppercase" style={{ color: "#8a6820" }}>
                  The Card Game · 2026 Edition
                </p>
                <p className="text-base sm:text-lg leading-relaxed max-w-md mx-auto font-body" style={{ color: "#5a3a10" }}>
                  Learn the rules. Track your game. Play with confidence.
                </p>
              </div>

              {/* Round structure strip */}
              <div className="opacity-0 animate-slide-up mt-8" style={{ animationDelay: "0.2s" }}>
                <div className="inline-flex flex-wrap justify-center items-center gap-1 px-4 py-2.5 rounded-xl"
                  style={{ background: "rgba(236,220,176,0.9)", border: "1px solid #c8a860" }}>
                  <span className="text-[10px] font-heading text-ark-text-muted tracking-[0.15em] uppercase mr-2">Each round:</span>
                  {phases.map((p, i) => (
                    <div key={p.label} className="flex items-center gap-1">
                      {p.skip && i === 0 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}30` }}>
                          skip R1
                        </span>
                      )}
                      <span className="text-xs font-heading font-semibold" style={{ color: p.color }}>{p.label}</span>
                      {i < phases.length - 1 && <span className="text-[#8a7040] text-xs mx-0.5">→</span>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ── Decorative divider ────────────────────────── */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #c8a860)" }} />
              <span className="text-[10px] font-heading tracking-[0.3em] uppercase" style={{ color: "#8a7040" }}>✦ ✦ ✦</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #c8a860, transparent)" }} />
            </div>
          </div>

          {/* ── Start Here ────────────────────────────────── */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">

            {/* Section heading */}
            <div className="opacity-0 animate-slide-up mb-8" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-4">
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #c8a860)" }} />
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                  style={{ background: "rgba(200,135,26,0.08)", border: "1px solid rgba(200,135,26,0.3)" }}>
                  <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="#8a6820" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M8 1 L8 15 M1 8 L8 1 L15 8" />
                  </svg>
                  <span className="text-xs font-heading font-semibold tracking-[0.15em] uppercase" style={{ color: "#6a4a10" }}>
                    New? Start Here
                  </span>
                </div>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #c8a860, transparent)" }} />
              </div>
            </div>

            {/* 4 step cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {startSteps.map((step, i) => (
                <Link key={step.href} href={step.href} className="group block opacity-0 animate-slide-up"
                  style={{ animationDelay: `${0.35 + i * 0.07}s` }}>
                  <div className="relative h-full rounded-xl p-5 flex gap-4 transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: "#ecdcb0",
                      border: `1px solid #c8a860`,
                      boxShadow: "0 3px 14px rgba(90,58,8,0.10), inset 0 1px 0 rgba(255,248,200,0.7)"
                    }}>
                    {/* Left colour bar */}
                    <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                      style={{ background: step.color }} />
                    {/* Step number */}
                    <div className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center font-heading font-bold text-sm ml-2"
                      style={{
                        background: `${step.color}14`,
                        border: `1.5px solid ${step.color}40`,
                        color: step.color,
                      }}>
                      {step.n}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="font-heading font-semibold text-sm leading-snug"
                          style={{ color: "#2a1808" }}>
                          {step.title}
                        </h3>
                        <span className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full font-heading"
                          style={{ background: `${step.color}14`, color: step.color, border: `1px solid ${step.color}30` }}>
                          {step.tag}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed font-body" style={{ color: "#6a5030" }}>{step.desc}</p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="#8a6820" strokeWidth="1.8" strokeLinecap="round">
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
            <div className="flex items-center gap-4">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, #c8a860)" }} />
              <span className="text-xs font-heading tracking-widest uppercase" style={{ color: "#8a7040" }}>All Topics</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #c8a860, transparent)" }} />
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
              style={{ background: "#ecdcb0", border: "1px solid #c8a860",
                boxShadow: "0 3px 14px rgba(90,58,8,0.10), inset 0 1px 0 rgba(255,248,200,0.7)" }}>

              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(138,104,32,0.1)", border: "1px solid rgba(138,104,32,0.3)" }}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="#8a6820" strokeWidth="1.7" strokeLinecap="round">
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2"/>
                      <circle cx="19" cy="7" r="3"/>
                      <path d="M22 21v-1.5a3 3 0 00-3-3"/>
                    </svg>
                  </div>
                  <h2 className="font-heading font-bold text-base" style={{ color: "#2a1808" }}>
                    The 5 Investigators
                  </h2>
                  <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #c8a860, transparent)" }} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[
                    { name: "Daniela Reyes",    class: "Guardian",  color: "#4a8fd4", hp: 9, san: 5, stats: "Will 3 · Int 2 · Com 5 · Agi 2" },
                    { name: "Joe Diamond",      class: "Seeker",    color: "#c8871a", hp: 7, san: 7, stats: "Will 2 · Int 4 · Com 4 · Agi 2" },
                    { name: "Trish Scarborough",class: "Rogue",     color: "#2e8a50", hp: 8, san: 6, stats: "Will 2 · Int 4 · Com 2 · Agi 4" },
                    { name: "Dexter Drake",     class: "Mystic",    color: "#7050b8", hp: 6, san: 8, stats: "Will 5 · Int 2 · Com 2 · Agi 3" },
                    { name: "Isabelle Barnes",  class: "Survivor",  color: "#b82020", hp: 9, san: 5, stats: "Will 4 · Int 2 · Com 3 · Agi 3" },
                  ].map((inv) => (
                    <div key={inv.name} className="rounded-xl p-4 flex flex-col gap-2"
                      style={{
                        background: `${inv.color}0e`,
                        border: `1px solid ${inv.color}35`
                      }}>
                      <div className="text-[10px] font-heading font-semibold tracking-widest uppercase" style={{ color: inv.color }}>
                        {inv.class}
                      </div>
                      <div className="font-heading text-xs font-semibold leading-tight" style={{ color: "#2a1808" }}>
                        {inv.name}
                      </div>
                      <div className="text-[10px] leading-relaxed font-body" style={{ color: "#6a5030" }}>
                        {inv.stats}
                      </div>
                      <div className="flex gap-2 mt-auto pt-1">
                        <div className="flex items-center gap-1">
                          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="#b82020" strokeWidth="1.5">
                            <path d="M6 10 C6 10 1 7 1 4 a2.5 2.5 0 015 0 2.5 2.5 0 015 0 c0 3-5 6-5 6z"/>
                          </svg>
                          <span className="text-[11px] font-mono font-semibold" style={{ color: "#b82020" }}>{inv.hp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" stroke="#7050b8" strokeWidth="1.5">
                            <path d="M10 6 A5 5 0 1 1 6 1 A3.5 3.5 0 0 0 10 6z"/>
                          </svg>
                          <span className="text-[11px] font-mono font-semibold" style={{ color: "#7050b8" }}>{inv.san}</span>
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
                style={{ border: "1px solid #b89848", background: "#2a1808",
                  boxShadow: "0 4px 24px rgba(42,24,8,0.25)" }}>
                {/* Top gold line */}
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: "linear-gradient(90deg, transparent, #c8a860, transparent)" }}/>
                <div className="relative flex flex-col sm:flex-row items-center gap-5 p-6 sm:p-8">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(200,168,96,0.12)", border: "1px solid rgba(200,168,96,0.3)" }}>
                    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="#c8a860" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"/>
                      <path d="M8 21 L16 21 M12 17 L12 21"/>
                      <circle cx="12" cy="10" r="3"/>
                      <path d="M9 10 h1 M14 10 h1"/>
                    </svg>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-heading font-bold text-xl mb-1" style={{ color: "#f0e4c0" }}>
                      Ready to play?
                    </h3>
                    <p className="text-sm leading-relaxed font-body" style={{ color: "#c0a870" }}>
                      Track damage, horror, and resources for your whole group. Share a session code — everyone syncs in real time.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-heading font-semibold tracking-wider transition-all group-hover:brightness-110"
                      style={{ background: "#c8a860", color: "#2a1808",
                        boxShadow: "0 2px 12px rgba(200,168,96,0.25)" }}>
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

          {/* ── Platform footer ───────────────────────────── */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
            <div className="rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ background: "#ecdcb0", border: "1px solid #c8a860" }}>
              <div>
                <p className="text-xs font-heading font-semibold tracking-widest uppercase mb-0.5" style={{ color: "#8a6820" }}>Game Train</p>
                <p className="text-xs font-body" style={{ color: "#6a5030" }}>
                  Interactive board game companions — learn faster, play smarter.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-heading" style={{ color: "#6a5030" }}>
                <span className="px-2.5 py-1 rounded-full" style={{ background: "rgba(138,104,32,0.12)", border: "1px solid rgba(138,104,32,0.3)", color: "#6a4a10" }}>
                  Arkham Horror ✓
                </span>
                <span className="px-2.5 py-1 rounded-full" style={{ background: "rgba(138,104,32,0.06)", border: "1px solid #c8a860", color: "#8a7040" }}>
                  More games coming
                </span>
              </div>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
