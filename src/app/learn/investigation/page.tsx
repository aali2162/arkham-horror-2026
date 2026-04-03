import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import StepCard from "@/components/learn/StepCard";
import DefinitionBox from "@/components/learn/DefinitionBox";
import ExampleBox from "@/components/learn/ExampleBox";
import EdgeCaseBox from "@/components/learn/EdgeCaseBox";
import { phases } from "@/data/phases";
import { actions } from "@/data/actions";

export default function InvestigationPage() {
  const phase = phases.find((p) => p.id === "investigation")!;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BackButton href="/" label="All Topics" />

        {/* Header */}
        <div className="mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{phase.icon}</span>
            <div>
              <p className="text-ark-blue text-sm font-mono uppercase tracking-wider">
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

        {/* Steps */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            How It Works
          </h2>
          <div className="divide-y divide-ark-border">
            {phase.steps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </section>

        {/* Definitions */}
        <section className="mb-10">
          {phase.definitions.map((def) => (
            <DefinitionBox key={def.term} {...def} />
          ))}
        </section>

        {/* 10 Actions Grid */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-2">
            Your 10 Actions
          </h2>
          <p className="text-ark-text-dim text-sm mb-6">
            Tap any action to see its full detail page — step-by-step process, examples, edge cases, and strategy tips.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.map((action, i) => (
              <Link
                key={action.id}
                href={`/learn/investigation/${action.id}`}
                className="card p-4 flex items-center gap-3 opacity-0 animate-slide-up hover:border-ark-blue/40"
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <span className="text-2xl w-10 h-10 flex items-center justify-center bg-ark-blue/10 rounded-lg">
                  {action.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-ark-text-muted text-xs font-mono">
                      {action.number}.
                    </span>
                    <h3 className="font-display font-bold text-sm text-ark-text">
                      {action.name}
                    </h3>
                  </div>
                  <p className="text-ark-text-dim text-xs truncate">
                    {action.tagline}
                  </p>
                </div>
                <span className="text-ark-text-muted text-xs">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Example */}
        {phase.example && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-xl text-ark-text mb-4">
              Example Turn
            </h2>
            <ExampleBox title="A Typical Turn" narrative={phase.example} />
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
