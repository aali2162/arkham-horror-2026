"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createSession, getSessionByCode } from "@/lib/session";

export default function PlayPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [lastSession, setLastSession] = useState<string | null>(null);

  // Load last session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ark_last_session");
    if (saved) setLastSession(saved);
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    const session = await createSession();
    if (session) {
      localStorage.setItem("ark_last_session", session.session_code);
      localStorage.setItem(`ark_creator_${session.session_code}`, "1");
      router.push(`/play/${session.session_code}`);
    } else {
      setError("Failed to create session. Check your Supabase configuration.");
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setJoining(true);
    setError("");
    const formatted = joinCode.trim().toUpperCase();
    const session = await getSessionByCode(formatted);
    if (session) {
      localStorage.setItem("ark_last_session", session.session_code);
      router.push(`/play/${session.session_code}`);
    } else {
      setError(`No session found with code "${formatted}". Check the code and try again.`);
      setJoining(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="text-center mb-10 opacity-0 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-3xl"
            style={{ background: "linear-gradient(135deg, rgba(201,151,58,0.15), rgba(10,8,5,0.8))", border: "1px solid rgba(201,151,58,0.3)" }}>
            🎮
          </div>
          <h1 className="font-sans font-bold text-3xl text-ark-text mb-2">Play Session</h1>
          <p className="text-ark-text-muted text-sm max-w-sm mx-auto leading-relaxed">
            Track investigators turn-by-turn with live sync across all devices. Log actions, damage, horror, and resources as you play.
          </p>
        </div>

        {/* Rejoin last session */}
        {lastSession && (
          <div className="rounded-xl p-4 mb-6 flex items-center justify-between gap-4"
            style={{ background: "rgba(58,158,107,0.07)", border: "1px solid rgba(58,158,107,0.3)" }}>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider mb-0.5" style={{ color: "#5bbf8a" }}>Last Session</p>
              <p className="font-mono font-bold text-base tracking-widest text-ark-text">{lastSession}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => router.push(`/play/${lastSession}`)}
                className="px-4 py-2 rounded-lg text-sm font-semibold font-sans transition-all"
                style={{ background: "rgba(58,158,107,0.15)", border: "1px solid rgba(58,158,107,0.4)", color: "#5bbf8a" }}>
                Rejoin →
              </button>
              <button onClick={() => { localStorage.removeItem("ark_last_session"); setLastSession(null); }}
                className="w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-all"
                style={{ background: "rgba(26,20,16,0.5)", border: "1px solid #3d3020", color: "#5a4838" }}
                title="Clear saved session">✕</button>
            </div>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

          {/* Create */}
          <div className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #1a1410, #120e09)", border: "1px solid #3d3020", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "rgba(201,151,58,0.12)", border: "1px solid rgba(201,151,58,0.3)" }}>✨</div>
              <div>
                <h2 className="font-sans font-bold text-base text-ark-text">New Session</h2>
                <p className="text-ark-text-muted text-xs">Host a fresh game</p>
              </div>
            </div>
            <p className="text-ark-text-muted text-sm leading-relaxed">
              Start a new session. You will receive a session code to share with other players — everyone joins the same live game board.
            </p>
            <button onClick={handleCreate} disabled={creating}
              className="btn-gold w-full py-3 text-sm font-semibold rounded-lg disabled:opacity-40">
              {creating ? "Creating…" : "Create New Session"}
            </button>
          </div>

          {/* Join */}
          <div className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
            style={{ background: "linear-gradient(135deg, #1a1410, #120e09)", border: "1px solid #3d3020", boxShadow: "0 4px 20px rgba(0,0,0,0.4)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: "rgba(74,143,212,0.12)", border: "1px solid rgba(74,143,212,0.3)" }}>🔗</div>
              <div>
                <h2 className="font-sans font-bold text-base text-ark-text">Join Session</h2>
                <p className="text-ark-text-muted text-xs">Enter an existing game</p>
              </div>
            </div>
            <p className="text-ark-text-muted text-sm leading-relaxed">
              Have a session code? Enter it below to join and see the live game state.
            </p>
            <input type="text" value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              placeholder="AHCG-XXXXX"
              className="ark-input w-full px-4 py-3 text-center font-mono text-sm tracking-[0.2em] rounded-lg" />
            <button onClick={handleJoin} disabled={joining || !joinCode.trim()}
              className="btn-ghost w-full py-3 text-sm font-semibold rounded-lg disabled:opacity-40">
              {joining ? "Joining…" : "Join Session"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl p-4 text-center mb-6"
            style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)" }}>
            <p className="text-sm" style={{ color: "#e74c3c" }}>{error}</p>
          </div>
        )}

        {/* What you get */}
        <div className="rounded-xl p-5" style={{ background: "rgba(26,20,16,0.6)", border: "1px solid #3d3020" }}>
          <h3 className="font-sans font-semibold text-sm text-ark-text mb-4 flex items-center gap-2">
            <span>⚡</span> What you get in each session
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ark-text-muted">
            {[
              { icon: "👥", text: "All investigators on one screen" },
              { icon: "🎯", text: "Turn-by-turn action logging" },
              { icon: "❤️", text: "Live damage & horror tracking" },
              { icon: "🔄", text: "Real-time sync across devices" },
              { icon: "🎲", text: "In-game rules reference panel" },
              { icon: "📋", text: "Action history per investigator" },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-2">
                <span className="text-base">{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

      </main>
    </>
  );
}
