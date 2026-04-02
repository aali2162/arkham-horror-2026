"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import PlayerCard from "@/components/play/PlayerCard";
import AddPlayerForm from "@/components/play/AddPlayerForm";
import BackButton from "@/components/learn/BackButton";
import { getSessionByCode, getPlayers, subscribeToPlayers } from "@/lib/session";
import { GameSession, GamePlayer } from "@/types";

export default function SessionPage() {
  const params = useParams();
  const sessionCode = (params.sessionCode as string)?.toUpperCase();

  const [session, setSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const loadSession = useCallback(async () => {
    if (!sessionCode) return;
    setLoading(true);
    const s = await getSessionByCode(sessionCode);
    if (!s) {
      setError(`Session "${sessionCode}" not found.`);
      setLoading(false);
      return;
    }
    setSession(s);
    const p = await getPlayers(s.id);
    setPlayers(p);
    setLoading(false);
  }, [sessionCode]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Real-time subscription
  useEffect(() => {
    if (!session) return;
    const unsubscribe = subscribeToPlayers(session.id, setPlayers);
    return unsubscribe;
  }, [session]);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-HTTPS
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="animate-pulse">
            <div className="w-48 h-6 bg-ark-surface rounded mx-auto mb-4" />
            <div className="w-64 h-4 bg-ark-surface rounded mx-auto" />
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
          <BackButton href="/play" label="Back to Play" />
          <div className="bg-ark-red/10 border border-ark-red/30 rounded-xl p-6">
            <p className="text-ark-red text-lg font-semibold mb-2">Session Not Found</p>
            <p className="text-ark-text-dim text-sm">{error}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <BackButton href="/play" label="All Sessions" />

        {/* Session Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-ark-text-muted text-xs uppercase tracking-widest mb-1">
              Session Code
            </p>
            <h1 className="font-mono font-bold text-2xl text-ark-blue tracking-wider">
              {sessionCode}
            </h1>
            <p className="text-ark-text-muted text-xs mt-1">
              {players.length} player{players.length !== 1 ? "s" : ""} connected
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-ark-blue hover:bg-ark-blue-dim text-white font-semibold rounded-lg transition-colors text-sm flex items-center gap-2"
            >
              {copied ? "✓ Copied!" : "📋 Copy Link"}
            </button>
          </div>
        </div>

        {/* Real-time indicator */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-ark-green animate-pulse" />
          <span className="text-ark-text-muted text-xs">
            Live — changes sync across all connected browsers
          </span>
        </div>

        {/* Player Grid + Add Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Players */}
          <div className="lg:col-span-2">
            {players.length === 0 ? (
              <div className="card p-8 text-center">
                <span className="text-4xl block mb-3">👥</span>
                <p className="text-ark-text-dim text-sm">
                  No players yet. Add your first player using the form.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {players.map((player) => (
                  <PlayerCard key={player.id} player={player} />
                ))}
              </div>
            )}
          </div>

          {/* Add Player Form */}
          <div>
            {session && <AddPlayerForm sessionId={session.id} />}

            {/* Quick reference */}
            <div className="card p-4 mt-4">
              <h4 className="font-bold text-ark-text text-xs uppercase tracking-wider mb-2">
                Quick Reference
              </h4>
              <div className="space-y-1.5 text-xs text-ark-text-dim">
                <p>❤️ <span className="text-ark-text-muted">Damage</span> — track physical hits</p>
                <p>🧠 <span className="text-ark-text-muted">Horror</span> — track mental strain</p>
                <p>💰 <span className="text-ark-text-muted">Resources</span> — track spending power</p>
                <p className="pt-1 border-t border-ark-border text-ark-text-muted">
                  Tap +/− to update. All changes sync live.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
