import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import StepCard from "@/components/learn/StepCard";
import DefinitionBox from "@/components/learn/DefinitionBox";
import ExampleBox from "@/components/learn/ExampleBox";
import EdgeCaseBox from "@/components/learn/EdgeCaseBox";
import { actions } from "@/data/actions";

interface Props {
  params: { action: string };
}

export function generateStaticParams() {
  return actions.map((a) => ({ action: a.id }));
}

export default function ActionDetailPage({ params }: Props) {
  const action = actions.find((a) => a.id === params.action);
  if (!action) return notFound();

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BackButton href="/learn/investigation" label="All Actions" />

        {/* Header */}
        <div className="mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{action.icon}</span>
            <div>
              <p className="text-ark-blue text-sm font-mono uppercase tracking-wider">
                Action {action.number} of 10
              </p>
              <h1 className="font-display font-extrabold text-3xl text-ark-text">
                {action.name}
              </h1>
            </div>
          </div>
          <p className="text-ark-text-dim text-base leading-relaxed">
            {action.description}
          </p>
        </div>

        {/* Requirements */}
        {action.requirements.length > 0 && (
          <div className="bg-ark-amber/8 border border-ark-amber/20 rounded-xl p-4 mb-8">
            <p className="font-bold text-ark-amber text-sm mb-2 flex items-center gap-2">
              <span>⚠️</span> Requirements
            </p>
            <ul className="space-y-1">
              {action.requirements.map((req, i) => (
                <li key={i} className="text-ark-text-dim text-sm flex items-start gap-2">
                  <span className="text-ark-amber mt-0.5">•</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Step-by-Step */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Step-by-Step Process
          </h2>
          <div className="divide-y divide-ark-border">
            {action.steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4 py-4">
                <div className="step-number">{step.number}</div>
                <div className="flex-1 pt-1">
                  <h4 className="font-display font-bold text-ark-text text-base mb-1">
                    {step.instruction}
                  </h4>
                  {step.detail && (
                    <p className="text-ark-text-dim text-[15px] leading-relaxed">
                      {step.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Definitions */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Key Definitions
          </h2>
          {action.definitions.map((def) => (
            <DefinitionBox key={def.term} {...def} />
          ))}
        </section>

        {/* Example */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Worked Example
          </h2>
          <ExampleBox
            title={action.example.title}
            narrative={action.example.narrative}
            breakdown={action.example.breakdown}
          />
        </section>

        {/* Edge Cases */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Common Questions & Edge Cases
          </h2>
          {action.edgeCases.map((ec) => (
            <EdgeCaseBox key={ec.question} {...ec} />
          ))}
        </section>

        {/* When to Use */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            When & Why to Use This
          </h2>
          <div className="card p-5">
            <ul className="space-y-2">
              {action.whenToUse.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-[15px]">
                  <span className="text-ark-green mt-0.5">✓</span>
                  <span className="text-ark-text-dim">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Special Interactions */}
        {action.specialInteractions.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-xl text-ark-text mb-4">
              Special Interactions
            </h2>
            <div className="space-y-2">
              {action.specialInteractions.map((si, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-ark-blue-glow rounded-lg p-3"
                >
                  <span className="text-ark-blue">⚡</span>
                  <p className="text-ark-text-dim text-sm">{si}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Keywords */}
        {action.keywords && action.keywords.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display font-bold text-xl text-ark-text mb-4">
              Keywords That Affect This Action
            </h2>
            {action.keywords.map((kw) => (
              <div
                key={kw.name}
                className="bg-ark-red/5 border border-ark-red/20 rounded-xl p-4 mb-3"
              >
                <p className="font-bold text-ark-red text-sm mb-1">{kw.name}</p>
                <p className="text-ark-text-dim text-sm">{kw.effect}</p>
              </div>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
