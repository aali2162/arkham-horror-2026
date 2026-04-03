import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import DefinitionBox from "@/components/learn/DefinitionBox";
import ExampleBox from "@/components/learn/ExampleBox";
import { damageData } from "@/data/damage";
import { investigators } from "@/data/investigators";

export default function DamagePage() {
  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <BackButton href="/" label="All Topics" />

        {/* Header */}
        <div className="mb-8 opacity-0 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💀</span>
            <div>
              <p className="text-ark-red text-sm font-mono uppercase tracking-wider">
                Survival Guide
              </p>
              <h1 className="font-display font-extrabold text-3xl text-ark-text">
                Damage, Horror & Trauma
              </h1>
            </div>
          </div>
          <p className="text-ark-text-dim text-base leading-relaxed">
            Your investigator can be broken in two ways: physically (damage to health) and mentally (horror to sanity). Survive a scenario but get defeated? You carry permanent trauma into every future scenario. Accumulate too much and you die — forever.
          </p>
        </div>

        {/* Investigator health/sanity quick reference */}
        <div className="card p-5 mb-8">
          <h3 className="font-display font-bold text-base text-ark-text mb-3">
            Investigator Health & Sanity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {investigators.map((inv) => (
              <div key={inv.name} className="flex items-center justify-between bg-ark-surface rounded-lg px-3 py-2 border border-ark-border">
                <span className="text-ark-text font-medium">{inv.name}</span>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-ark-red">♥ {inv.health}</span>
                  <span className="text-ark-purple">🧠 {inv.sanity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sections */}
        {damageData.sections.map((section) => (
          <section key={section.id} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="font-display font-bold text-xl text-ark-text">
                {section.title}
              </h2>
            </div>

            <p className="text-ark-text-dim text-base leading-relaxed mb-6">
              {section.description}
            </p>

            {/* Definitions */}
            {section.definitions.map((def) => (
              <DefinitionBox key={def.term} {...def} />
            ))}

            {/* Key Details */}
            <div className="card p-5 mt-4 mb-4">
              <h4 className="font-bold text-ark-text text-sm mb-3">Key Details</h4>
              <ul className="space-y-2">
                {section.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-ark-blue mt-0.5">•</span>
                    <span className="text-ark-text-dim">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Example */}
            <ExampleBox title={`${section.title} Example`} narrative={section.example} />
          </section>
        ))}

        {/* Death vs Resignation comparison */}
        <section className="mb-10">
          <h2 className="font-display font-bold text-xl text-ark-text mb-4">
            Defeated vs Resigned — The Critical Difference
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-ark-red/5 border border-ark-red/30 rounded-xl p-4">
              <h3 className="font-bold text-ark-red text-sm mb-2">💀 Defeated</h3>
              <ul className="space-y-1 text-sm text-ark-text-dim">
                <li>• Health or Sanity hits zero</li>
                <li>• Removed from scenario</li>
                <li>• <span className="text-ark-red font-semibold">Take 1 trauma (PERMANENT)</span></li>
                <li>• Very bad outcome</li>
              </ul>
            </div>
            <div className="bg-ark-green/5 border border-ark-green/30 rounded-xl p-4">
              <h3 className="font-bold text-ark-green text-sm mb-2">🚪 Resigned</h3>
              <ul className="space-y-1 text-sm text-ark-text-dim">
                <li>• Voluntary exit (action)</li>
                <li>• Removed from scenario</li>
                <li>• <span className="text-ark-green font-semibold">NO trauma</span></li>
                <li>• Strategic retreat</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
