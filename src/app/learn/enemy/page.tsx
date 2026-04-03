import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import PhaseNav from "@/components/learn/PhaseNav";
import StepCard from "@/components/learn/StepCard";
import DefinitionBox from "@/components/learn/DefinitionBox";
import ExampleBox from "@/components/learn/ExampleBox";
import EdgeCaseBox from "@/components/learn/EdgeCaseBox";
import { phases } from "@/data/phases";

export default function EnemyPage() {
  const phase = phases.find((p) => p.id === "enemy")!;

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
              <p className="text-ark-red text-sm font-mono uppercase tracking-wider">
                Phase {phase.number}
              </p>
              <h1 className="font-display font-extrabold text-3xl text-ark-text">
                {phase.name}
              </h1>
            </div>
          </div>
          <p className="text-ark-text-dim text-base leading-relaxed">{phase.description}</p>
        </div>

        {/* Hunter movement visualization */}
        <div className="card p-5 mb-8">
          <h3 className="font-display font-bold text-base text-ark-text mb-3">Hunter Movement — Visual</h3>
          <div className="flex items-center justify-center gap-2 text-sm font-mono py-4 flex-wrap">
            <div className="bg-ark-red/10 border border-ark-red/30 rounded-lg px-3 py-2 text-center">
              <p className="text-ark-red font-bold">Location A</p>
              <p className="text-xs text-ark-text-muted">👹 Ghoul starts here</p>
            </div>
            <span className="text-ark-text-muted text-lg">→</span>
            <div className="bg-ark-surface border border-ark-border rounded-lg px-3 py-2 text-center">
              <p className="text-ark-text font-bold">Location B</p>
              <p className="text-xs text-ark-text-muted">Moves here (Round 1)</p>
            </div>
            <span className="text-ark-text-muted text-lg">→</span>
            <div className="bg-ark-blue/10 border border-ark-blue/30 rounded-lg px-3 py-2 text-center">
              <p className="text-ark-blue font-bold">Location C</p>
              <p className="text-xs text-ark-text-muted">🔍 You are here</p>
            </div>
          </div>
          <p className="text-center text-ark-text-muted text-xs mt-2">
            Hunter enemies move 1 location closer each Enemy Phase until they reach you
          </p>
        </div>

        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">Step-by-Step Process</h2>
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
            <ExampleBox title="Hunter Ghoul Pursuit" narrative={phase.example} />
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
