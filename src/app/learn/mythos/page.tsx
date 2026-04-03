import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import PhaseNav from "@/components/learn/PhaseNav";
import StepCard from "@/components/learn/StepCard";
import DefinitionBox from "@/components/learn/DefinitionBox";
import ExampleBox from "@/components/learn/ExampleBox";
import EdgeCaseBox from "@/components/learn/EdgeCaseBox";
import { phases } from "@/data/phases";

export default function MythosPage() {
  const phase = phases.find((p) => p.id === "mythos")!;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BackButton href="/" label="All Topics" />
        <PhaseNav />

        {/* Header */}
        <div className="mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{phase.icon}</span>
            <div>
              <p className="text-ark-purple text-sm font-mono uppercase tracking-wider">
                Phase {phase.number}
              </p>
              <h1 className="font-display font-extrabold text-3xl text-ark-text">
                {phase.name}
              </h1>
            </div>
          </div>
          <p className="text-ark-text-dim text-base leading-relaxed">
            {phase.description}
          </p>
        </div>

        {/* Alert: Round 1 */}
        <div className="bg-ark-amber/10 border border-ark-amber/30 rounded-xl p-4 mb-8 flex items-start gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <p className="font-bold text-ark-amber text-sm mb-1">Round 1 Exception</p>
            <p className="text-ark-text-dim text-sm">
              The very first round skips the Mythos Phase entirely. No doom is placed, no encounter cards are drawn. You start directly with the Investigation Phase.
            </p>
          </div>
        </div>

        {/* Steps */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Step-by-Step Process
          </h2>
          <div className="divide-y divide-ark-border">
            {phase.steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </section>

        {/* Definitions */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Key Definitions
          </h2>
          {phase.definitions.map((def) => (
            <DefinitionBox key={def.term} {...def} />
          ))}
        </section>

        {/* Example */}
        {phase.example && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-xl text-ark-text mb-4">
              Worked Example
            </h2>
            <ExampleBox title="Doom Accumulation" narrative={phase.example} />
          </section>
        )}

        {/* Edge Cases */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Common Questions
          </h2>
          {phase.edgeCases.map((ec) => (
            <EdgeCaseBox key={ec.question} {...ec} />
          ))}
        </section>
      </main>
    </>
  );
}
