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
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) return;
    setAdding(true);
    await addPlayer(sessionId, name.trim(), investigator);
    setName("");
    setAdding(false);
  };

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: "rgba(26,20,16,0.8)", border: "1px solid rgba(201,151,58,0.25)" }}>
      <h3 className="font-decorative font-bold text-sm text-ark-text">Add Investigator</h3>
      <input value={name} onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleAdd()}
        placeholder="Player name"
        className="ark-input w-full px-3 py-2.5 rounded-lg text-sm" />
      <select value={investigator} onChange={e => setInvestigator(e.target.value)}
        className="ark-input w-full px-3 py-2.5 rounded-lg text-sm">
        {investigators.map(inv => (
          <option key={inv.name} value={inv.name}>{inv.name} — {inv.class}</option>
        ))}
      </select>
      <button onClick={handleAdd} disabled={adding || !name.trim()}
        className="btn-gold w-full py-2.5 text-sm rounded-lg disabled:opacity-40">
        {adding ? "Adding…" : "Add to Session"}
      </button>
    </div>
  );
}
