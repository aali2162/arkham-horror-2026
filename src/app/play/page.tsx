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
      <main className="d-page pb-12">

        {/* ── TOP BAR ── */}
        <div className="d-topbar">
          <div>
            <span className="d-topbar-title">PLAY SESSION</span>
            <span className="d-topbar-sub">INVESTIGATOR&apos;S DOSSIER</span>
          </div>
          <div className="d-phase-pill">ARKHAM HORROR</div>
        </div>

        {/* ── REJOIN LAST SESSION ── */}
        {lastSession && (
          <div style={{ margin: "16px 16px 0", background: "#fff", border: "2px solid #1a1208", borderLeft: "5px solid #2e8a50", padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#3a2808", marginBottom: 6 }}>↩ LAST SESSION</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, letterSpacing: "4px", color: "#1a1208" }}>{lastSession}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => router.push(`/play/${lastSession}`)}
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "10px 16px", background: "#1a1208", border: "2px solid #1a1208", color: "#f2e8cc", cursor: "pointer" }}>
                  Rejoin →
                </button>
                <button
                  onClick={() => { localStorage.removeItem("ark_last_session"); setLastSession(null); }}
                  style={{ width: 36, height: 36, background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", fontFamily: "'Cinzel', serif", fontSize: 12, cursor: "pointer" }}
                  title="Clear saved session">✕</button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION LABEL ── */}
        <div className="d-section-head" style={{ marginTop: 20 }}>
          <span>BEGIN YOUR INVESTIGATION</span>
        </div>

        {/* ── NEW SESSION ── */}
        <div style={{ margin: "0 0 2px", background: "#fff", border: "none", borderBottom: "2px solid #e8e0cc" }}>
          {/* Colour bar — gold for create */}
          <div style={{ height: 4, background: "#c9a84c" }} />
          <div style={{ padding: "18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, background: "#1a1208", border: "2px solid #c9a84c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 4v16M4 12h16" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "#1a1208", marginBottom: 2 }}>New Session</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>Host a fresh investigation</div>
              </div>
            </div>
            <p style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#3a2808", lineHeight: 1.6, marginBottom: 16 }}>
              Begin a new game. You&apos;ll receive a session code to share — every investigator joins the same live board from their own device.
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="d-btn-ink">
              {creating ? "Creating…" : "✦  CREATE NEW SESSION  ✦"}
            </button>
          </div>
        </div>

        {/* ── JOIN SESSION ── */}
        <div style={{ margin: "0 0 2px", background: "#fff", borderBottom: "2px solid #e8e0cc" }}>
          {/* Colour bar — blue for join */}
          <div style={{ height: 4, background: "#4a8fd4" }} />
          <div style={{ padding: "18px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, background: "#1a1208", border: "2px solid #4a8fd4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#4a8fd4" strokeWidth="2"/>
                  <path d="M8 12h8M12 8v8" stroke="#4a8fd4" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "#1a1208", marginBottom: 2 }}>Join Session</div>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>Enter an existing investigation</div>
              </div>
            </div>
            <p style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#3a2808", lineHeight: 1.6, marginBottom: 16 }}>
              Have a session code? Enter it below to join your party and track the live game state on your device.
            </p>
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              placeholder="AHCG-XXXXX"
              className="d-input"
              style={{ textAlign: "center", letterSpacing: "0.25em", marginBottom: 12, fontFamily: "'Cinzel', serif" }}
            />
            <button
              onClick={handleJoin}
              disabled={joining || !joinCode.trim()}
              className="d-btn-outline">
              {joining ? "Joining…" : "JOIN SESSION"}
            </button>
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div style={{ margin: "0 0 2px", background: "#fce8e8", border: "none", borderLeft: "4px solid #b82020", padding: "14px 16px" }}>
            <p style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#8a2020" }}>{error}</p>
          </div>
        )}

        {/* ── WHAT AWAITS ── */}
        <div className="d-section-head" style={{ marginTop: 20 }}>
          <span>WHAT AWAITS YOUR PARTY</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "#1a1208" }}>
          {[
            { color: "#4a8fd4", label: "All Investigators", desc: "Every player on one shared board", svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="7" cy="6" r="3" stroke="#4a8fd4" strokeWidth="1.5"/><circle cx="13" cy="6" r="3" stroke="#4a8fd4" strokeWidth="1.5"/><path d="M2 17c0-3 2.5-5 5-5h6c2.5 0 5 2 5 5" stroke="#4a8fd4" strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { color: "#b82020", label: "Turn-by-Turn Log",  desc: "Action history per investigator",   svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="1" stroke="#b82020" strokeWidth="1.5"/><path d="M6 7h8M6 10h8M6 13h5" stroke="#b82020" strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { color: "#c8871a", label: "Damage & Horror",   desc: "Live health and sanity tracking",   svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 16s-7-5-7-9a4 4 0 018 0 4 4 0 018 0c0 4-7 9-9 9z" stroke="#c8871a" strokeWidth="1.5" fill="none"/></svg> },
            { color: "#4a8fd4", label: "Real-Time Sync",    desc: "Instant updates, all devices",      svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="#4a8fd4" strokeWidth="1.5"/><path d="M10 6v4l3 2" stroke="#4a8fd4" strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { color: "#c8871a", label: "Rules Reference",   desc: "Phases, skills, token types",       svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3h10v14H5z" stroke="#c8871a" strokeWidth="1.5"/><path d="M8 7h4M8 10h4M8 13h2" stroke="#c8871a" strokeWidth="1.5" strokeLinecap="round"/></svg> },
            { color: "#2e8a50", label: "Enemy Tracker",     desc: "HP, keywords, engagement",          svg: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3L17 7v6l-7 4-7-4V7z" stroke="#2e8a50" strokeWidth="1.5"/><path d="M10 3v14M3 7l7 4 7-4" stroke="#2e8a50" strokeWidth="1" strokeOpacity="0.5"/></svg> },
          ].map(f => (
            <div key={f.label} style={{ background: "#fff", padding: "14px 14px" }}>
              <div style={{ borderTop: `3px solid ${f.color}`, paddingTop: 10 }}>
                <div style={{ marginBottom: 6 }}>{f.svg}</div>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: "#1a1208", marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── FOOTER QUOTE ── */}
        <div style={{ padding: "24px 16px", borderTop: "2px solid #1a1208", marginTop: 2, textAlign: "center" }}>
          <p style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>
            &ldquo;In the darkness of Arkham, only the prepared survive.&rdquo;
          </p>
        </div>

      </main>
    </>
  );
}
