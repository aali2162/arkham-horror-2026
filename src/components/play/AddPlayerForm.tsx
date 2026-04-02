"use client";

import { useState } from "react";
import { investigators } from "@/data/investigators";
import { addPlayer } from "@/lib/session";

interface AddPlayerFormProps {
  sessionId: string;
}

export default function AddPlayerForm({ sessionId }: AddPlayerFormProps) {
  const [name, setName] = useState("");
  const [investigator, setInvestigator] = useState(investigators[0].name);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    await addPlayer(sessionId, name.trim(), investigator);
    setName("");
    setLoading(false);
  };

  return (
    <div className="card p-5">
      <h3 className="font-display font-bold text-base text-ark-text mb-4">
        Add Player
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ark-text-muted mb-1">
            Player Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Enter name…"
            className="w-full px-3 py-2 bg-ark-surface border border-ark-border rounded-lg text-ark-text placeholder-ark-text-muted text-sm focus:outline-none focus:border-ark-blue transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ark-text-muted mb-1">
            Investigator
          </label>
          <select
            value={investigator}
            onChange={(e) => setInvestigator(e.target.value)}
            className="w-full px-3 py-2 bg-ark-surface border border-ark-border rounded-lg text-ark-text text-sm focus:outline-none focus:border-ark-blue transition-colors"
          >
            {investigators.map((inv) => (
              <option key={inv.name} value={inv.name}>
                {inv.name} — {inv.class} (♥{inv.health} 🧠{inv.sanity})
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="w-full py-2.5 bg-ark-blue hover:bg-ark-blue-dim text-white font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          {loading ? "Adding…" : "Add Player"}
        </button>
      </div>
    </div>
  );
}
