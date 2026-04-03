import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import PhaseNav from "@/components/learn/PhaseNav";
import StepCard from "@/components/learn/StepCard";
import DefinitionBox from "@/components/learn/DefinitionBox";
import ExampleBox from "@/components/learn/ExampleBox";
import EdgeCaseBox from "@/components/learn/EdgeCaseBox";
import { phases } from "@/data/phases";

export default function UpkeepPage() {
  const phase = phases.find((p) => p.id === "upkeep")!;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BackButton href="/" label="All Topics" />
        <PhaseNav />

        <div className="mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{phase.icon}</span>
            <div>
              <p className="text-ark-green text-sm font-mono uppercase tracking-wider">
                Phase {phase.number}
              </p>
              <h1 className="font-display font-extrabold text-3xl text-ark-text">
                {phase.name}
              </h1>
            </div>
          </div>
          <p className="text-ark-text-dim text-base leading-relaxed">{phase.description}</p>
        </div>

        {/* Round cycle diagram */}
        <div className="card p-5 mb-8">
          <h3 className="font-display font-bold text-base text-ark-text mb-3">Round Cycle</h3>
          <div className="flex items-center justify-center gap-2 text-xs font-mono py-3 flex-wrap">
            {["🌑 Mythos", "🔍 Investigation", "👹 Enemy", "🔄 Upkeep"].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-lg border ${
                  i === 3
                    ? "bg-ark-green/10 border-ark-green/40 text-ark-green font-bold"
                    : "bg-ark-surface border-ark-border text-ark-text-dim"
                }`}>
                  {label}
                </span>
                {i < 3 && <span className="text-ark-text-muted">→</span>}
              </div>
            ))}
          </div>
          <p className="text-center text-ark-text-muted text-xs mt-2">
            After Upkeep, return to Mythos to start the next round
          </p>
        </div>

        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">Step-by-Step</h2>
          <div className="divide-y divide-ark-border">
            {phase.steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">Key Definitions</h2>
          {phase.definitions.map((def) => (
            <DefinitionBox key={def.term} {...def} />
          ))}
        </section>

        {phase.example && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-xl text-ark-text mb-4">Worked Example</h2>
            <ExampleBox title="Upkeep Resolution" narrative={phase.example} />
          </section>
        )}

        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">Common Questions</h2>
          {phase.edgeCases.map((ec) => (
            <EdgeCaseBox key={ec.question} {...ec} />
          ))}
        </section>
      </main>
    </>
  );
}
