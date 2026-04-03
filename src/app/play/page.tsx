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
      <main className="max-w-xl mx-auto px-4 sm:px-6 pb-14">

        {/* ── HEADER ── */}
        <div className="text-center" style={{ borderBottom: "2px solid #c8a860" }}>
          {/* Ornament band */}
          <div className="flex items-center justify-center gap-2 py-2 px-6"
            style={{ background: "#d4b870", borderBottom: "1px solid #b89848" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(90,58,8,0.25)" }} />
            <div style={{ width: 5, height: 5, background: "#5a3a08", transform: "rotate(45deg)", flexShrink: 0 }} />
            <span className="font-heading text-[7px] font-bold tracking-[4px]" style={{ color: "#5a3a08", whiteSpace: "nowrap" }}>
              ARKHAM HORROR · THE CARD GAME
            </span>
            <div style={{ width: 5, height: 5, background: "#5a3a08", transform: "rotate(45deg)", flexShrink: 0 }} />
            <div style={{ flex: 1, height: 1, background: "rgba(90,58,8,0.25)" }} />
          </div>

          {/* Medallion icon */}
          <div className="pt-6 pb-1 flex flex-col items-center">
            <div className="flex items-center justify-center mb-4"
              style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "radial-gradient(circle at 40% 35%, #dcc888, #c8aa60)",
                border: "2px solid #8a6820",
                boxShadow: "0 4px 16px rgba(90,58,8,0.25), inset 0 2px 6px rgba(255,240,180,0.5), 0 0 0 4px rgba(184,152,72,0.2)",
                position: "relative",
              }}>
              {/* Inner ring */}
              <div style={{
                position: "absolute", inset: 6, borderRadius: "50%",
                border: "1px solid rgba(90,58,8,0.3)"
              }} />
              <span className="font-heading text-[24px]" style={{ color: "#3a2808", lineHeight: 1 }}>◎</span>
            </div>

            <h1 className="font-title font-bold tracking-[3px] mb-2"
              style={{ fontSize: 22, color: "#2a1808", textShadow: "0 1px 2px rgba(255,240,180,0.8)" }}>
              PLAY SESSION
            </h1>
            <p className="font-flavour text-sm pb-5 px-8 leading-relaxed" style={{ color: "#7a6030" }}>
              Summon your investigators. The investigation begins.
            </p>
          </div>

          {/* Bottom ornament */}
          <div className="flex items-center gap-2 px-8 pb-4">
            <div style={{ flex: 1, height: 1, background: "#b89848" }} />
            <div style={{ width: 3, height: 3, background: "#b89848", borderRadius: "50%" }} />
            <div style={{ width: 7, height: 7, background: "#8a6820", transform: "rotate(45deg)", flexShrink: 0 }} />
            <div style={{ width: 3, height: 3, background: "#b89848", borderRadius: "50%" }} />
            <div style={{ flex: 1, height: 1, background: "#b89848" }} />
          </div>
        </div>

        {/* ── REJOIN LAST SESSION ── */}
        {lastSession && (
          <div className="mx-0 mt-4 flex items-center justify-between gap-3 rounded-xl px-4 py-3"
            style={{
              background: "#e8f0e0",
              border: "1.5px solid #6a9a5a",
              borderLeft: "4px solid #3a7a28",
              boxShadow: "0 2px 8px rgba(58,122,40,0.1)",
            }}>
            <div>
              <p className="font-heading text-[8px] font-bold tracking-[2px] mb-1" style={{ color: "#3a7a28" }}>
                ↩ LAST SESSION
              </p>
              <p className="font-mono font-bold text-base tracking-[2px]" style={{ color: "#1a2e14" }}>
                {lastSession}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(`/play/${lastSession}`)}
                className="font-heading text-[10px] font-bold tracking-[1px] rounded-md px-3 py-2 transition-all"
                style={{ background: "#c8e0b0", border: "1.5px solid #5a8a48", color: "#2a5a18" }}>
                Rejoin →
              </button>
              <button
                onClick={() => { localStorage.removeItem("ark_last_session"); setLastSession(null); }}
                className="flex items-center justify-center rounded-md text-xs transition-all"
                style={{ width: 28, height: 28, background: "#f0e8cc", border: "1px solid #c8a860", color: "#8a7040" }}
                title="Clear saved session">✕</button>
            </div>
          </div>
        )}

        {/* ── SECTION DIVIDER ── */}
        <div className="flex items-center gap-2 my-5">
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #b89848)" }} />
          <div style={{ width: 3, height: 3, background: "#b89848", borderRadius: "50%" }} />
          <div style={{ width: 7, height: 7, background: "#8a6820", transform: "rotate(45deg)", flexShrink: 0 }} />
          <span className="font-heading text-[8px] font-bold tracking-[3px] px-2" style={{ color: "#8a6820" }}>
            BEGIN YOUR INVESTIGATION
          </span>
          <div style={{ width: 7, height: 7, background: "#8a6820", transform: "rotate(45deg)", flexShrink: 0 }} />
          <div style={{ width: 3, height: 3, background: "#b89848", borderRadius: "50%" }} />
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #b89848, transparent)" }} />
        </div>

        {/* ── NEW SESSION CARD ── */}
        <div className="rounded-xl overflow-hidden mb-4"
          style={{
            background: "#ecdcb0",
            border: "1.5px solid #c8a860",
            boxShadow: "0 3px 12px rgba(90,58,8,0.12), inset 0 1px 0 rgba(255,248,200,0.6)",
          }}>
          {/* Gold top rule */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #8a6820, #d4a840, #8a6820)" }} />
          <div className="p-5">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 46, height: 46,
                  background: "radial-gradient(circle at 35% 30%, #dcc870, #c0a048)",
                  border: "1.5px solid #8a6820",
                  boxShadow: "inset 0 2px 4px rgba(255,240,160,0.5), 0 2px 6px rgba(90,58,8,0.2)",
                  fontSize: 22, color: "#3a2808",
                }}>
                ✦
              </div>
              <div>
                <p className="font-heading font-bold text-sm mb-0.5" style={{ color: "#1e1206" }}>New Session</p>
                <p className="font-body text-xs font-normal italic" style={{ color: "#8a7040" }}>Host a fresh investigation</p>
              </div>
            </div>
            {/* Inner rule */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #c8a860, #c8a860, transparent)", marginBottom: 12 }} />
            <p className="font-body text-sm leading-relaxed mb-4" style={{ color: "#3a2808" }}>
              Begin a new game. You&apos;ll receive a session code to share — every investigator joins the same live board from their own device.
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="btn-gold w-full py-3 text-xs tracking-widest disabled:opacity-40">
              {creating ? "Creating…" : "✦  CREATE NEW SESSION  ✦"}
            </button>
          </div>
        </div>

        {/* ── JOIN SESSION CARD ── */}
        <div className="rounded-xl overflow-hidden mb-4"
          style={{
            background: "#ecdcb0",
            border: "1.5px solid #a8c0d8",
            boxShadow: "0 3px 12px rgba(90,58,8,0.1), inset 0 1px 0 rgba(255,248,200,0.6)",
          }}>
          {/* Blue top rule */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #3a5a8a, #4a8fd4, #3a5a8a)" }} />
          <div className="p-5">
            {/* Card header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{
                  width: 46, height: 46,
                  background: "radial-gradient(circle at 35% 30%, #a8c8e8, #6090c0)",
                  border: "1.5px solid #4a7aaa",
                  boxShadow: "inset 0 2px 4px rgba(180,220,255,0.4), 0 2px 6px rgba(58,90,138,0.2)",
                  fontSize: 22, color: "#1a3858",
                }}>
                ⊞
              </div>
              <div>
                <p className="font-heading font-bold text-sm mb-0.5" style={{ color: "#1e1206" }}>Join Session</p>
                <p className="font-body text-xs font-normal italic" style={{ color: "#8a7040" }}>Enter an existing investigation</p>
              </div>
            </div>
            {/* Inner rule */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #c8a860, #c8a860, transparent)", marginBottom: 12 }} />
            <p className="font-body text-sm leading-relaxed mb-4" style={{ color: "#3a2808" }}>
              Have a session code? Enter it below to join your party and track the live game state on your device.
            </p>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              placeholder="AHCG-XXXXX"
              className="ark-input w-full px-4 py-3 text-center font-mono text-sm mb-3"
              style={{ letterSpacing: "0.25em", borderRadius: 6 }}
            />
            <button
              onClick={handleJoin}
              disabled={joining || !joinCode.trim()}
              className="btn-ghost w-full py-3 text-xs tracking-widest disabled:opacity-40">
              {joining ? "Joining…" : "JOIN SESSION"}
            </button>
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="rounded-xl p-4 text-center mb-4"
            style={{ background: "#fce8e8", border: "1.5px solid #d07070" }}>
            <p className="font-body text-sm" style={{ color: "#8a2020" }}>{error}</p>
          </div>
        )}

        {/* ── FEATURE GRID ── */}
        <div className="mt-2">
          {/* Feature header */}
          <div className="flex items-center justify-center gap-3 py-2 mb-3"
            style={{
              background: "#e0cca0",
              border: "1px solid #b89848",
              borderRadius: 8,
            }}>
            <div style={{ width: 5, height: 5, background: "#8a6820", transform: "rotate(45deg)", flexShrink: 0 }} />
            <span className="font-heading text-[8px] font-bold tracking-[3px]" style={{ color: "#5a3a08" }}>
              WHAT AWAITS YOUR PARTY
            </span>
            <div style={{ width: 5, height: 5, background: "#8a6820", transform: "rotate(45deg)", flexShrink: 0 }} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "☽", label: "All Investigators", desc: "Every player on one shared board", color: "#7050b8" },
              { icon: "⚔", label: "Turn-by-Turn Log",  desc: "Action history per investigator",   color: "#b82020" },
              { icon: "♥", label: "Damage & Horror",   desc: "Live health and sanity tracking",   color: "#C9973A" },
              { icon: "◈", label: "Real-Time Sync",    desc: "Instant updates, all devices",      color: "#4a8fd4" },
              { icon: "✦", label: "Rules Reference",   desc: "Phases, skills, token types",       color: "#c8871a" },
              { icon: "☗", label: "Enemy Tracker",     desc: "HP, keywords, engagement",          color: "#2e8a50" },
            ].map(f => (
              <div key={f.label} className="rounded-xl overflow-hidden"
                style={{ background: "#f0e8cc", border: "1px solid #c8a860", boxShadow: "0 2px 6px rgba(90,58,8,0.08)" }}>
                {/* Class-colour top accent */}
                <div style={{ height: 3, background: f.color }} />
                <div className="flex gap-2 p-3 items-start">
                  <div className="flex items-center justify-center rounded-lg flex-shrink-0"
                    style={{ width: 28, height: 28, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,0,0,0.06)", fontSize: 14, color: f.color }}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="font-heading text-[9px] font-bold mb-0.5" style={{ color: "#1e1206" }}>{f.label}</p>
                    <p className="font-body text-[11px]" style={{ color: "#6a5030", lineHeight: 1.4 }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER QUOTE ── */}
        <div className="mt-6 text-center pt-4"
          style={{ borderTop: "1.5px solid #c8a860" }}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div style={{ width: 3, height: 3, background: "#b89848", borderRadius: "50%" }} />
            <div style={{ width: 5, height: 5, background: "#8a6820", transform: "rotate(45deg)" }} />
            <div style={{ width: 3, height: 3, background: "#b89848", borderRadius: "50%" }} />
          </div>
          <p className="font-flavour text-xs" style={{ color: "#8a7040" }}>
            &ldquo;In the darkness of Arkham, only the prepared survive.&rdquo;
          </p>
        </div>

      </main>
    </>
  );
}
