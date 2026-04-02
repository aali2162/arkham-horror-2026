"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createSession, getSessionByCode } from "@/lib/session";

export default function PlayPage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    const session = await createSession();
    if (session) {
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
      router.push(`/play/${session.session_code}`);
    } else {
      setError(`No session found with code "${formatted}". Check the code and try again.`);
      setJoining(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <span className="text-4xl mb-4 block">🎮</span>
          <h1 className="font-display font-extrabold text-3xl text-ark-text mb-3">
            Play Session
          </h1>
          <p className="text-ark-text-dim text-base max-w-md mx-auto">
            Create a shared session to track damage, horror, and resources for every player in real-time. Share the link — everyone sees updates live.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Create */}
          <div className="card p-6 text-center">
            <span className="text-3xl mb-3 block">✨</span>
            <h2 className="font-display font-bold text-lg text-ark-text mb-2">
              New Session
            </h2>
            <p className="text-ark-text-dim text-sm mb-5">
              Start a fresh game session and invite players with a shareable link.
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full py-3 bg-ark-blue hover:bg-ark-blue-dim text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {creating ? "Creating…" : "Create Session"}
            </button>
          </div>

          {/* Join */}
          <div className="card p-6 text-center">
            <span className="text-3xl mb-3 block">🔗</span>
            <h2 className="font-display font-bold text-lg text-ark-text mb-2">
              Join Session
            </h2>
            <p className="text-ark-text-dim text-sm mb-4">
              Enter a session code to join an existing game.
            </p>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="AHCG-XXXXX"
              className="w-full px-3 py-2 mb-3 bg-ark-surface border border-ark-border rounded-lg text-ark-text placeholder-ark-text-muted text-sm text-center font-mono tracking-wider focus:outline-none focus:border-ark-blue"
            />
            <button
              onClick={handleJoin}
              disabled={joining || !joinCode.trim()}
              className="w-full py-3 bg-ark-surface border border-ark-border hover:border-ark-blue text-ark-text font-semibold rounded-lg transition-colors disabled:opacity-50 text-sm"
            >
              {joining ? "Joining…" : "Join Session"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-ark-red/10 border border-ark-red/30 rounded-xl p-4 text-center">
            <p className="text-ark-red text-sm">{error}</p>
          </div>
        )}

        {/* Setup info */}
        <div className="mt-12 card p-6">
          <h3 className="font-display font-bold text-base text-ark-text mb-3">
            🛠️ First Time Setup
          </h3>
          <p className="text-ark-text-dim text-sm leading-relaxed mb-3">
            Sessions require a Supabase backend for real-time sync. If you haven&apos;t set it up yet, see the{" "}
            <span className="text-ark-blue font-semibold">SUPABASE_SETUP.md</span> file in the project repo for complete instructions — takes about 5 minutes.
          </p>
          <p className="text-ark-text-muted text-xs">
            Without Supabase configured, you&apos;ll see an error when creating sessions. The Learn section works without any backend.
          </p>
        </div>
      </main>
    </>
  );
}
