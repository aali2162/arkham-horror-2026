import Navbar from "@/components/layout/Navbar";
import TopicCard from "@/components/learn/TopicCard";

const topics = [
  {
    href: "/learn/mythos",
    icon: "🌑",
    title: "Phase 1: Mythos",
    tagline: "Doom accumulates, enemies move, encounter cards strike. The world grows darker.",
    color: "purple" as const,
  },
  {
    href: "/learn/investigation",
    icon: "🔍",
    title: "Phase 2: Investigation",
    tagline: "Your turn. 3 actions, 10 choices. Investigate, fight, evade, and more.",
    color: "blue" as const,
  },
  {
    href: "/learn/enemy",
    icon: "👹",
    title: "Phase 3: Enemy",
    tagline: "Enemies hunt you and attack automatically. Brace for impact.",
    color: "red" as const,
  },
  {
    href: "/learn/upkeep",
    icon: "🔄",
    title: "Phase 4: Upkeep",
    tagline: "Reset cards, draw, gain resources, enforce hand limit. Prepare for next round.",
    color: "green" as const,
  },
  {
    href: "/learn/skill-tests",
    icon: "🎲",
    title: "Skill Tests",
    tagline: "The universal mechanic. 5 steps to success or failure. Master the chaos bag.",
    color: "amber" as const,
  },
  {
    href: "/learn/damage",
    icon: "💀",
    title: "Damage & Trauma",
    tagline: "Health, sanity, trauma, death. How your investigator breaks — and dies.",
    color: "red" as const,
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-ark-blue/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
            <div className="opacity-0 animate-fade-in">
              <p className="text-ark-blue font-mono text-sm tracking-widest uppercase mb-4">
                Arkham Horror: The Card Game — 2026 Edition
              </p>
              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-ark-text leading-tight mb-6">
                Learn Every Rule.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-ark-blue to-ark-purple">
                  Fear Nothing.
                </span>
              </h1>
              <p className="text-ark-text-dim text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                Interactive guides for every phase, action, and mechanic — designed for beginners with zero assumed knowledge. Tap any topic to dive deep.
              </p>
            </div>

            {/* Round structure reminder */}
            <div className="mt-10 inline-flex items-center gap-2 bg-ark-card border border-ark-border rounded-full px-5 py-2.5 text-sm opacity-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <span className="text-ark-text-muted">Round structure:</span>
              <span className="text-ark-purple font-semibold">Mythos</span>
              <span className="text-ark-text-muted">→</span>
              <span className="text-ark-blue font-semibold">Investigation</span>
              <span className="text-ark-text-muted">→</span>
              <span className="text-ark-red font-semibold">Enemy</span>
              <span className="text-ark-text-muted">→</span>
              <span className="text-ark-green font-semibold">Upkeep</span>
            </div>

            <p className="mt-3 text-ark-text-muted text-xs opacity-0 animate-fade-in" style={{ animationDelay: "0.35s" }}>
              ⚡ Round 1 skips Mythos — start directly with Investigation
            </p>
          </div>
        </section>

        {/* Topic grid */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic, i) => (
              <TopicCard key={topic.href} {...topic} delay={i + 1} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
