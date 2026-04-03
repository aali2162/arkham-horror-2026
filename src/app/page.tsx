import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import TopicCard from "@/components/learn/TopicCard";

const topics = [
  {
    href: "/learn/mythos",
    icon: "🌑",
    title: "Phase 1: Mythos",
    tagline: "Doom accumulates, enemies move, encounter cards strike. The world grows darker.",
    color: "purple" as const,
    detail: "Doom · Encounter · Spawn",
  },
  {
    href: "/learn/investigation",
    icon: "🔍",
    title: "Phase 2: Investigation",
    tagline: "Your turn. 3 actions, 10 choices. Investigate, fight, evade, and more.",
    color: "blue" as const,
    detail: "3 Actions · 10 Options",
  },
  {
    href: "/learn/enemy",
    icon: "👹",
    title: "Phase 3: Enemy",
    tagline: "Enemies hunt you and attack automatically. Brace for impact.",
    color: "red" as const,
    detail: "Hunt · Attack · Aloof",
  },
  {
    href: "/learn/upkeep",
    icon: "🔄",
    title: "Phase 4: Upkeep",
    tagline: "Reset cards, draw, gain resources, enforce hand limit. Prepare for next round.",
    color: "green" as const,
    detail: "Draw · Resources · Ready",
  },
  {
    href: "/learn/skill-tests",
    icon: "🎲",
    title: "Skill Tests",
    tagline: "The universal mechanic. 5 steps to success or failure. Master the chaos bag.",
    color: "amber" as const,
    detail: "5 Steps · 12 Tokens",
  },
  {
    href: "/learn/damage",
    icon: "💀",
    title: "Damage & Trauma",
    tagline: "Health, sanity, trauma, death. How your investigator breaks — and dies.",
    color: "red" as const,
    detail: "HP · Sanity · Defeat",
  },
];

const phases = [
  { label: "Mythos", color: "#7c5cbf" },
  { label: "Investigation", color: "#4a8fd4" },
  { label: "Enemy", color: "#c0392b" },
  { label: "Upkeep", color: "#3a9e6b" },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden">
          {/* Background glows */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full blur-[100px]"
              style={{ background: "radial-gradient(ellipse, rgba(201,151,58,0.06) 0%, transparent 70%)" }} />
            <div className="absolute top-20 right-1/4 w-[400px] h-[300px] rounded-full blur-[120px]"
              style={{ background: "radial-gradient(ellipse, rgba(124,92,191,0.05) 0%, transparent 70%)" }} />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center">

            {/* Eyebrow */}
            <div className="opacity-0 animate-fade-in mb-5">
              <span className="inline-flex items-center gap-2 text-xs font-decorative tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border"
                style={{ color: "#c9973a", borderColor: "rgba(201,151,58,0.3)", background: "rgba(201,151,58,0.06)" }}>
                <span className="live-dot" />
                Arkham Horror: The Card Game — 2026 Edition
              </span>
            </div>

            {/* Title */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h1 className="font-decorative font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5">
                <span style={{ background: "linear-gradient(135deg, #e8dcc8 0%, #c9973a 60%, #a07828 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Learn Every Rule.
                </span>
                <br />
                <span style={{ background: "linear-gradient(135deg, #e8dcc8 0%, #9b7dd4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Fear Nothing.
                </span>
              </h1>
              <p className="text-ark-text-dim text-lg max-w-xl mx-auto leading-relaxed">
                Interactive guides for every phase, action, and mechanic — designed for new investigators with zero assumed knowledge.
              </p>
            </div>

            {/* Round structure pill */}
            <div className="opacity-0 animate-slide-up mt-8" style={{ animationDelay: "0.22s" }}>
              <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-5 py-3 rounded-xl"
                style={{ background: "rgba(26,20,16,0.9)", border: "1px solid #3d3020", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
                <span className="text-xs font-decorative text-ark-text-muted tracking-wider uppercase">Round Structure</span>
                <div className="flex items-center gap-2">
                  {phases.map((p, i) => (
                    <div key={p.label} className="flex items-center gap-2">
                      <span className="text-xs font-semibold font-decorative" style={{ color: p.color }}>{p.label}</span>
                      {i < phases.length - 1 && (
                        <span className="text-ark-text-muted text-xs">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-ark-text-muted text-xs">
                ⚡ Round 1 skips Mythos — start with Investigation
              </p>
            </div>

          </div>
        </section>

        {/* ── Decorative divider ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="deco-divider deco-divider-gold mb-8">
            <span className="text-xs font-decorative tracking-widest text-ark-text-muted uppercase">Choose Your Study</span>
          </div>
        </div>

        {/* ── Topic grid ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, i) => (
              <TopicCard key={topic.href} {...topic} delay={i + 1} />
            ))}
          </div>
        </section>

        {/* ── Play CTA ── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <Link href="/play" className="group block">
            <div className="relative rounded-2xl overflow-hidden transition-all duration-300"
              style={{ border: "1px solid #3d3020", background: "linear-gradient(135deg, #1a1410 0%, #120e09 100%)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#8b6914"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(201,151,58,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#3d3020"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
              {/* BG glow */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(201,151,58,0.05) 0%, transparent 60%)" }} />
              <div className="relative flex flex-col sm:flex-row items-center gap-4 p-6 sm:p-8">
                <div className="flex-shrink-0 text-4xl">🎮</div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-decorative font-bold text-xl text-ark-text mb-1">Ready to Play?</h3>
                  <p className="text-ark-text-dim text-sm">Track damage, horror, and resources for all investigators in real-time. Share a session code with your group.</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-[#0a0805] transition-all"
                    style={{ background: "linear-gradient(135deg, #c9973a, #a07828)", boxShadow: "0 2px 12px rgba(201,151,58,0.3)" }}>
                    Open Play <span className="text-lg">→</span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>

      </main>
    </>
  );
}
