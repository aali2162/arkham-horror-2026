import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import StepCard from "@/components/learn/StepCard";
import ExampleBox from "@/components/learn/ExampleBox";
import { skillTestData } from "@/data/skillTests";

export default function SkillTestsPage() {
  const data = skillTestData;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BackButton href="/" label="All Topics" />

        {/* Header */}
        <div className="mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎲</span>
            <div>
              <p className="text-ark-amber text-sm font-mono uppercase tracking-wider">
                Core Mechanic
              </p>
              <h1 className="font-display font-extrabold text-3xl text-ark-text">
                Skill Tests
              </h1>
            </div>
          </div>
          <p className="text-ark-text-dim text-base leading-relaxed">
            Skill tests are the universal mechanic in Arkham Horror. Whenever you try something difficult — investigate, fight, evade, resist horror — you perform a skill test. It&apos;s a 5-step process that determines success or failure.
          </p>
        </div>

        {/* Formula */}
        <div className="card p-5 mb-8 text-center">
          <p className="text-ark-text-muted text-xs uppercase tracking-widest mb-2">The Formula</p>
          <p className="font-mono text-lg text-ark-text">
            <span className="text-ark-blue">Your Skill</span>
            {" + "}
            <span className="text-ark-green">Card Icons</span>
            {" + "}
            <span className="text-ark-amber">Chaos Token</span>
            {" ≥ "}
            <span className="text-ark-red">Difficulty</span>
            {" = "}
            <span className="text-ark-purple font-bold">Success</span>
          </p>
        </div>

        {/* 5-Step Process */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            5-Step Process
          </h2>
          <div className="divide-y divide-ark-border">
            {data.steps.map((step) => (
              <StepCard key={step.number} number={step.number} title={step.title} detail={step.detail} />
            ))}
          </div>
        </section>

        {/* 4 Skills */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            The 4 Skills
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.skills.map((skill) => (
              <div key={skill.name} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{skill.icon}</span>
                  <h3 className="font-display font-bold text-ark-text">{skill.name}</h3>
                </div>
                <p className="text-ark-text-dim text-sm leading-relaxed">{skill.usedFor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Chaos Tokens */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Chaos Bag Tokens
          </h2>
          <p className="text-ark-text-dim text-sm mb-4">
            After committing skill cards, you draw 1 random chaos token. This is the element of luck that can make or break your test.
          </p>
          <div className="space-y-2">
            {data.chaosTokens.map((token) => (
              <div key={token.name} className="flex items-start gap-3 bg-ark-surface rounded-lg p-3 border border-ark-border">
                <span className="font-mono font-bold text-ark-text w-16 flex-shrink-0 text-sm pt-0.5">
                  {token.name}
                </span>
                <div className="flex-1">
                  <span className="text-ark-text-muted text-xs font-mono mr-2">
                    [{token.modifier}]
                  </span>
                  <span className="text-ark-text-dim text-sm">{token.description}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Worked Example */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Complete Example
          </h2>
          <ExampleBox
            title={data.example.title}
            narrative={data.example.narrative}
            breakdown={data.example.breakdown}
          />
        </section>

        {/* Tips */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Strategy Tips
          </h2>
          <div className="card p-5 space-y-3">
            {[
              "Test at +2 above difficulty for a comfortable margin. The chaos bag is cruel.",
              "Don't over-commit cards to easy tests. Save them for hard ones.",
              "The Autofail token means you can never be 100% safe. Accept the risk.",
              "Wild icons on cards work for any skill test — they're the most flexible.",
              "If your skill is 2+ below the difficulty, don't waste cards. Save them.",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-ark-green mt-0.5">✓</span>
                <span className="text-ark-text-dim">{tip}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
