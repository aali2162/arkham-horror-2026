"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import { getSessionByCode, getPlayers, subscribeToPlayers, addPlayer, removePlayer, updatePlayerStat } from "@/lib/session";
import { GameSession, GamePlayer } from "@/types";
import { investigators } from "@/data/investigators";

// ─── Action definitions ───────────────────────────────────────────────────
const ACTIONS = [
  { id: "investigate", icon: "🔍", label: "Investigate", color: "#4a8fd4", desc: "Test Intellect at a location to collect clues" },
  { id: "move", icon: "🚶", label: "Move", color: "#3a9e6b", desc: "Move to a connecting location" },
  { id: "fight", icon: "⚔️", label: "Fight", color: "#c0392b", desc: "Attack an enemy at your location" },
  { id: "evade", icon: "💨", label: "Evade", color: "#d4922a", desc: "Attempt to disengage from an enemy" },
  { id: "engage", icon: "🗡️", label: "Engage", color: "#c0392b", desc: "Engage an enemy at your location" },
  { id: "draw", icon: "🃏", label: "Draw", color: "#7c5cbf", desc: "Draw 1 card from your deck" },
  { id: "resource", icon: "💰", label: "Gain Resource", color: "#c9973a", desc: "Gain 1 resource" },
  { id: "play", icon: "✋", label: "Play Card", color: "#4a8fd4", desc: "Play an asset, event, or skill card" },
  { id: "activate", icon: "⚡", label: "Activate", color: "#7c5cbf", desc: "Use an ability on a card in play" },
  { id: "resign", icon: "🚪", label: "Resign", color: "#5a5a5a", desc: "Leave the scenario (escape to safety)" },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────
interface ActionLog {
  id: string;
  playerName: string;
  investigator: string;
  action: string;
  actionIcon: string;
  detail: string;
  timestamp: Date;
  round: number;
  actionNum: number; // 1, 2, or 3
}

interface TurnState {
  currentPlayerIdx: number;
  actionsUsed: number; // 0-3
  round: number;
  phase: "investigation" | "enemy" | "upkeep" | "mythos";
}

// ─── Component ────────────────────────────────────────────────────────────
export default function SessionPage() {
  const params = useParams();
  const sessionCode = (params.sessionCode as string)?.toUpperCase();

  const [session, setSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [addingName, setAddingName] = useState("");
  const [addingInvestigator, setAddingInvestigator] = useState(investigators[0].name);
  const [addingPlayer, setAddingPlayer] = useState(false);

  // Turn tracking
  const [turnState, setTurnState] = useState<TurnState>({
    currentPlayerIdx: 0,
    actionsUsed: 0,
    round: 1,
    phase: "investigation",
  });

  // Action log
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);

  // Action modal
  const [selectedAction, setSelectedAction] = useState<typeof ACTIONS[number] | null>(null);
  const [actionDetail, setActionDetail] = useState("");
  const [activeTab, setActiveTab] = useState<"board" | "log" | "reference">("board");

  // Stat change flash animation
  const [flashStats, setFlashStats] = useState<Record<string, string>>({});

  const loadSession = useCallback(async () => {
    if (!sessionCode) return;
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

  useEffect(() => { loadSession(); }, [loadSession]);

  useEffect(() => {
    if (!session) return;
    const unsubscribe = subscribeToPlayers(session.id, setPlayers);
    return unsubscribe;
  }, [session]);

  // ─── Helpers ────────────────────────────────────────────────────────────
  const currentPlayer = players[turnState.currentPlayerIdx] ?? null;

  const flashStat = (playerId: string, stat: string) => {
    const key = `${playerId}-${stat}`;
    setFlashStats(prev => ({ ...prev, [key]: "flash" }));
    setTimeout(() => setFlashStats(prev => { const n = { ...prev }; delete n[key]; return n; }), 600);
  };

  const handleStatChange = async (player: GamePlayer, field: "damage" | "horror" | "resources", delta: number) => {
    const newVal = Math.max(0, player[field] + delta);
    flashStat(player.id, field);
    await updatePlayerStat(player.id, field, newVal);
  };

  const handleLogAction = () => {
    if (!currentPlayer || !selectedAction) return;
    const log: ActionLog = {
      id: `${Date.now()}`,
      playerName: currentPlayer.player_name,
      investigator: currentPlayer.investigator,
      action: selectedAction.label,
      actionIcon: selectedAction.icon,
      detail: actionDetail || selectedAction.desc,
      timestamp: new Date(),
      round: turnState.round,
      actionNum: turnState.actionsUsed + 1,
    };
    setActionLog(prev => [log, ...prev]);
    const newActionsUsed = turnState.actionsUsed + 1;
    if (newActionsUsed >= 3) {
      // End of this player's turn
      const nextIdx = (turnState.currentPlayerIdx + 1) % players.length;
      const newRound = nextIdx === 0 ? turnState.round + 1 : turnState.round;
      setTurnState({ currentPlayerIdx: nextIdx, actionsUsed: 0, round: newRound, phase: "investigation" });
    } else {
      setTurnState(prev => ({ ...prev, actionsUsed: newActionsUsed }));
    }
    setSelectedAction(null);
    setActionDetail("");
  };

  const handleEndTurn = () => {
    if (!currentPlayer) return;
    const nextIdx = (turnState.currentPlayerIdx + 1) % players.length;
    const newRound = nextIdx === 0 ? turnState.round + 1 : turnState.round;
    setTurnState({ currentPlayerIdx: nextIdx, actionsUsed: 0, round: newRound, phase: "investigation" });
    const log: ActionLog = {
      id: `end-${Date.now()}`,
      playerName: currentPlayer.player_name,
      investigator: currentPlayer.investigator,
      action: "End Turn",
      actionIcon: "⏭️",
      detail: `Ended turn with ${3 - turnState.actionsUsed} action(s) remaining`,
      timestamp: new Date(),
      round: turnState.round,
      actionNum: turnState.actionsUsed,
    };
    setActionLog(prev => [log, ...prev]);
  };

  const handleAddPlayer = async () => {
    if (!session || !addingName.trim()) return;
    setAddingPlayer(true);
    await addPlayer(session.id, addingName.trim(), addingInvestigator);
    setAddingName("");
    setShowAddPlayer(false);
    setAddingPlayer(false);
  };

  const handleRemove = async (player: GamePlayer) => {
    if (confirm(`Remove ${player.player_name}?`)) {
      await removePlayer(player.id);
      if (turnState.currentPlayerIdx >= players.length - 1) {
        setTurnState(prev => ({ ...prev, currentPlayerIdx: 0 }));
      }
    }
  };

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); }
    catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Loading/Error states ────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-40 rounded mx-auto" style={{ background: "#1a1410" }} />
            <div className="h-4 w-60 rounded mx-auto" style={{ background: "#1a1410" }} />
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-12">
          <BackButton href="/play" label="Back to Play" />
          <div className="rounded-xl p-6 text-center" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)" }}>
            <p className="font-decorative font-bold text-lg mb-2" style={{ color: "#e74c3c" }}>Session Not Found</p>
            <p className="text-ark-text-muted text-sm">{error}</p>
          </div>
        </main>
      </>
    );
  }

  // ─── Main render ─────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <BackButton href="/play" label="All Sessions" />

        {/* ── Session header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-ark-text-muted text-[10px] uppercase tracking-widest font-decorative">Session</p>
              <h1 className="font-mono font-bold text-xl tracking-wider" style={{ color: "#c9973a" }}>{sessionCode}</h1>
            </div>
            <div className="h-8 w-px" style={{ background: "#3d3020" }} />
            <div>
              <p className="text-ark-text-muted text-[10px] uppercase tracking-widest font-decorative">Round</p>
              <p className="font-decorative font-bold text-xl text-ark-text">{turnState.round}</p>
            </div>
            <div className="h-8 w-px" style={{ background: "#3d3020" }} />
            <div>
              <p className="text-ark-text-muted text-[10px] uppercase tracking-widest font-decorative">Players</p>
              <p className="font-decorative font-bold text-xl text-ark-text">{players.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
              style={{ background: "rgba(58,158,107,0.1)", border: "1px solid rgba(58,158,107,0.25)" }}>
              <span className="live-dot" />
              <span style={{ color: "#3a9e6b" }}>Live</span>
            </div>
            <button onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}>
              {copied ? "✓ Copied!" : "📋 Share Link"}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "rgba(26,20,16,0.8)", border: "1px solid #3d3020" }}>
          {(["board", "log", "reference"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-lg text-xs font-semibold font-decorative tracking-wide transition-all duration-200 capitalize"
              style={activeTab === tab
                ? { background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#0a0805", boxShadow: "0 2px 8px rgba(201,151,58,0.3)" }
                : { color: "#6b5840" }}>
              {tab === "board" ? "🎲 Board" : tab === "log" ? "📋 Action Log" : "📖 Reference"}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* ── BOARD TAB ────────────────────────────── */}
        {activeTab === "board" && (
          <div className="space-y-5">

            {/* Active turn banner */}
            {currentPlayer && players.length > 0 && (
              <div className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(201,151,58,0.1), rgba(26,20,16,0.9))", border: "1px solid rgba(201,151,58,0.35)", boxShadow: "0 0 30px rgba(201,151,58,0.08)" }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at left, rgba(201,151,58,0.06), transparent 60%)" }} />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-decorative font-bold text-sm text-[#0a0805]"
                    style={{ background: "linear-gradient(135deg, #c9973a, #a07828)", boxShadow: "0 0 12px rgba(201,151,58,0.4)" }}>
                    {currentPlayer.investigator[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted">Active Investigator</p>
                    <p className="font-decorative font-bold text-base text-ark-text">{currentPlayer.player_name}</p>
                    <p className="text-ark-text-muted text-xs">{currentPlayer.investigator}</p>
                  </div>
                </div>
                {/* Action pips */}
                <div className="relative flex items-center gap-3">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300"
                        style={i < (3 - turnState.actionsUsed)
                          ? { background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#0a0805", boxShadow: "0 0 8px rgba(201,151,58,0.4)" }
                          : { background: "rgba(61,48,32,0.4)", border: "1px solid #3d3020", color: "#3d3020" }}>
                        {i < (3 - turnState.actionsUsed) ? "●" : "○"}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-ark-text-muted font-decorative">
                    <span className="font-bold text-ark-text">{3 - turnState.actionsUsed}</span> action{(3 - turnState.actionsUsed) !== 1 ? "s" : ""} left
                  </div>
                  <button onClick={handleEndTurn}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold font-decorative tracking-wide transition-all"
                    style={{ background: "rgba(61,48,32,0.6)", border: "1px solid #5c4a2a", color: "#a89878" }}>
                    End Turn ⏭
                  </button>
                </div>
              </div>
            )}

            {/* Action grid */}
            {currentPlayer && players.length > 0 && (
              <div>
                <h3 className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted mb-3">
                  Log an Action for {currentPlayer.player_name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ACTIONS.map(action => (
                    <button key={action.id}
                      onClick={() => setSelectedAction(action)}
                      className="group flex flex-col items-center gap-1.5 p-3 rounded-xl text-center transition-all duration-200"
                      style={{ background: "rgba(26,20,16,0.8)", border: `1px solid #3d3020` }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = action.color + "60";
                        el.style.background = action.color + "12";
                        el.style.boxShadow = `0 0 16px ${action.color}20`;
                        el.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLElement;
                        el.style.borderColor = "#3d3020";
                        el.style.background = "rgba(26,20,16,0.8)";
                        el.style.boxShadow = "none";
                        el.style.transform = "translateY(0)";
                      }}>
                      <span className="text-xl leading-none">{action.icon}</span>
                      <span className="text-[11px] font-decorative font-semibold leading-tight" style={{ color: action.color }}>
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action modal */}
            {selectedAction && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
                onClick={e => { if (e.target === e.currentTarget) setSelectedAction(null); }}>
                <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
                  style={{ background: "#1a1410", border: `1px solid ${selectedAction.color}40`, boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${selectedAction.color}15` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ background: selectedAction.color + "18", border: `1px solid ${selectedAction.color}40` }}>
                      {selectedAction.icon}
                    </div>
                    <div>
                      <h3 className="font-decorative font-bold text-lg text-ark-text">{selectedAction.label}</h3>
                      <p className="text-ark-text-muted text-xs">{selectedAction.desc}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted block mb-2">
                      Add detail (optional)
                    </label>
                    <input value={actionDetail}
                      onChange={e => setActionDetail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleLogAction()}
                      placeholder={`e.g. "Investigated Library, passed with +2"`}
                      className="ark-input w-full px-3 py-2.5 rounded-lg text-sm" />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setSelectedAction(null)}
                      className="btn-ghost flex-1 py-2.5 text-sm rounded-lg">Cancel</button>
                    <button onClick={handleLogAction}
                      className="btn-gold flex-1 py-2.5 text-sm rounded-lg">
                      Log Action
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Player cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted">
                  Investigators
                </h3>
                <button onClick={() => setShowAddPlayer(!showAddPlayer)}
                  className="text-xs font-semibold font-decorative px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}>
                  + Add Investigator
                </button>
              </div>

              {showAddPlayer && (
                <div className="rounded-xl p-4 mb-4 space-y-3"
                  style={{ background: "rgba(26,20,16,0.8)", border: "1px solid rgba(201,151,58,0.25)" }}>
                  <h4 className="font-decorative font-semibold text-sm text-ark-text">Add Investigator</h4>
                  <input value={addingName} onChange={e => setAddingName(e.target.value)}
                    placeholder="Player name"
                    className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                  <select value={addingInvestigator} onChange={e => setAddingInvestigator(e.target.value)}
                    className="ark-input w-full px-3 py-2 rounded-lg text-sm">
                    {investigators.map(inv => (
                      <option key={inv.name} value={inv.name}>{inv.name} ({inv.class})</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddPlayer(false)}
                      className="btn-ghost flex-1 py-2 text-sm rounded-lg">Cancel</button>
                    <button onClick={handleAddPlayer} disabled={addingPlayer || !addingName.trim()}
                      className="btn-gold flex-1 py-2 text-sm rounded-lg disabled:opacity-40">
                      {addingPlayer ? "Adding…" : "Add to Session"}
                    </button>
                  </div>
                </div>
              )}

              {players.length === 0 ? (
                <div className="rounded-xl p-10 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed #3d3020" }}>
                  <span className="text-4xl block mb-3">👥</span>
                  <p className="text-ark-text-muted text-sm">No investigators yet — add your first one above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {players.map((player, idx) => {
                    const inv = investigators.find(i => i.name === player.investigator);
                    const isActive = idx === turnState.currentPlayerIdx;
                    const healthPct = Math.min((player.damage / (inv?.health ?? 9)) * 100, 100);
                    const sanityPct = Math.min((player.horror / (inv?.sanity ?? 7)) * 100, 100);
                    const isDefeated = player.damage >= (inv?.health ?? 9);
                    const isInsane = player.horror >= (inv?.sanity ?? 7);

                    return (
                      <div key={player.id}
                        className="rounded-xl p-4 relative transition-all duration-300"
                        style={{
                          background: "linear-gradient(135deg, #1a1410, #120e09)",
                          border: isActive ? "1px solid rgba(201,151,58,0.5)" : "1px solid #3d3020",
                          boxShadow: isActive ? "0 0 20px rgba(201,151,58,0.1), 0 4px 20px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.4)",
                        }}>

                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute -top-px left-4 right-4 h-px rounded-full"
                            style={{ background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.7), transparent)" }} />
                        )}

                        {/* Remove button */}
                        <button onClick={() => handleRemove(player)}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full text-xs opacity-0 hover:opacity-100 transition-all"
                          style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#c0392b" }}>
                          ✕
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3" style={{ paddingRight: "28px" }}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-decorative font-bold text-sm text-[#0a0805] flex-shrink-0"
                            style={{ background: isActive ? "linear-gradient(135deg, #c9973a, #a07828)" : "rgba(61,48,32,0.6)", color: isActive ? "#0a0805" : "#8a6030", border: isActive ? "none" : "1px solid #5c4a2a" }}>
                            {player.investigator[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-decorative font-bold text-sm text-ark-text truncate">{player.player_name}</p>
                              {isActive && <span className="text-[9px] font-decorative px-1.5 py-0.5 rounded" style={{ background: "rgba(201,151,58,0.2)", color: "#c9973a" }}>ACTIVE</span>}
                            </div>
                            <p className="text-[11px] text-ark-text-muted truncate">{player.investigator}</p>
                          </div>
                        </div>

                        {/* Status warnings */}
                        {(isDefeated || isInsane) && (
                          <div className="mb-2 px-2 py-1 rounded text-[10px] font-decorative font-bold text-center animate-pulse"
                            style={{ background: isDefeated ? "rgba(192,57,43,0.2)" : "rgba(124,92,191,0.2)", color: isDefeated ? "#e74c3c" : "#9b7dd4", border: `1px solid ${isDefeated ? "rgba(192,57,43,0.4)" : "rgba(124,92,191,0.4)"}` }}>
                            {isDefeated ? "☠️ DEFEATED" : "🌀 INSANE"}
                          </div>
                        )}

                        {/* Damage bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span style={{ color: "#c0392b" }}>❤️ {player.damage} / {inv?.health ?? 9}</span>
                            <div className="flex gap-1">
                              <button onClick={() => handleStatChange(player, "damage", -1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-all"
                                style={{ background: "rgba(192,57,43,0.15)", color: "#c0392b", border: "1px solid rgba(192,57,43,0.3)" }}>−</button>
                              <button onClick={() => handleStatChange(player, "damage", 1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-all"
                                style={{ background: "rgba(192,57,43,0.15)", color: "#c0392b", border: "1px solid rgba(192,57,43,0.3)" }}>+</button>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(192,57,43,0.1)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${healthPct}%`, background: `linear-gradient(90deg, #8e1a0e, #c0392b)` }} />
                          </div>
                        </div>

                        {/* Horror bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span style={{ color: "#7c5cbf" }}>🧠 {player.horror} / {inv?.sanity ?? 7}</span>
                            <div className="flex gap-1">
                              <button onClick={() => handleStatChange(player, "horror", -1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-all"
                                style={{ background: "rgba(124,92,191,0.15)", color: "#7c5cbf", border: "1px solid rgba(124,92,191,0.3)" }}>−</button>
                              <button onClick={() => handleStatChange(player, "horror", 1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold transition-all"
                                style={{ background: "rgba(124,92,191,0.15)", color: "#7c5cbf", border: "1px solid rgba(124,92,191,0.3)" }}>+</button>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(124,92,191,0.1)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${sanityPct}%`, background: "linear-gradient(90deg, #4a3578, #7c5cbf)" }} />
                          </div>
                        </div>

                        {/* Resources */}
                        <div className="flex items-center justify-between pt-2.5" style={{ borderTop: "1px solid #2e2318" }}>
                          <span className="text-[10px] font-decorative text-ark-text-muted uppercase tracking-wider">Resources</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleStatChange(player, "resources", -1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all"
                              style={{ background: "rgba(201,151,58,0.12)", color: "#c9973a", border: "1px solid rgba(201,151,58,0.3)" }}>−</button>
                            <span className="font-mono font-bold text-base w-6 text-center" style={{ color: "#c9973a" }}>
                              {player.resources}
                            </span>
                            <button onClick={() => handleStatChange(player, "resources", 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all"
                              style={{ background: "rgba(201,151,58,0.12)", color: "#c9973a", border: "1px solid rgba(201,151,58,0.3)" }}>+</button>
                          </div>
                        </div>

                        {/* Investigator stats */}
                        {inv && (
                          <div className="grid grid-cols-4 gap-1 mt-2.5 pt-2.5" style={{ borderTop: "1px solid #2e2318" }}>
                            {[
                              { label: "WIL", val: inv.willpower, color: "#7c5cbf" },
                              { label: "INT", val: inv.intellect, color: "#4a8fd4" },
                              { label: "COM", val: inv.combat, color: "#c0392b" },
                              { label: "AGI", val: inv.agility, color: "#3a9e6b" },
                            ].map(s => (
                              <div key={s.label} className="text-center py-1 rounded" style={{ background: "rgba(10,8,5,0.4)" }}>
                                <div className="text-[9px] text-ark-text-muted font-decorative">{s.label}</div>
                                <div className="font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* ── ACTION LOG TAB ─────────────────────── */}
        {activeTab === "log" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ark-text-muted font-decorative">{actionLog.length} action{actionLog.length !== 1 ? "s" : ""} logged</p>
              {actionLog.length > 0 && (
                <button onClick={() => setActionLog([])}
                  className="text-xs text-ark-text-muted hover:text-ark-text transition-colors">
                  Clear log
                </button>
              )}
            </div>

            {actionLog.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed #3d3020" }}>
                <span className="text-4xl block mb-3">📋</span>
                <p className="text-ark-text-muted text-sm">No actions logged yet. Use the Board tab to log actions.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {actionLog.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(26,20,16,0.7)", border: "1px solid #2e2318" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "rgba(61,48,32,0.5)", border: "1px solid #3d3020" }}>
                      {entry.actionIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-decorative font-bold text-sm text-ark-text">{entry.playerName}</span>
                        <span className="text-ark-text-muted text-xs">·</span>
                        <span className="text-xs font-semibold" style={{ color: ACTIONS.find(a => a.label === entry.action)?.color ?? "#c9973a" }}>
                          {entry.action}
                        </span>
                        <span className="text-ark-text-muted text-xs ml-auto">
                          R{entry.round} · Act {entry.actionNum}
                        </span>
                      </div>
                      <p className="text-ark-text-muted text-xs mt-0.5">{entry.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* ── REFERENCE TAB ─────────────────────── */}
        {activeTab === "reference" && (
          <div className="space-y-5">

            {/* Actions reference */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(201,151,58,0.08)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Investigation Actions (Phase 2)</h3>
                <p className="text-ark-text-muted text-xs">Each investigator gets 3 actions per turn</p>
              </div>
              <div className="divide-y" style={{ divideColor: "#2e2318" }}>
                {ACTIONS.map(action => (
                  <div key={action.id} className="flex items-center gap-3 px-4 py-3"
                    style={{ background: "rgba(26,20,16,0.6)" }}>
                    <span className="text-xl w-8 text-center">{action.icon}</span>
                    <div>
                      <span className="font-decorative font-semibold text-sm" style={{ color: action.color }}>{action.label}</span>
                      <p className="text-ark-text-muted text-xs">{action.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill test reminder */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(74,143,212,0.08)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Skill Test Steps</h3>
              </div>
              <div className="px-4 py-3 space-y-2" style={{ background: "rgba(26,20,16,0.6)" }}>
                {[
                  "Determine difficulty (the number you must beat)",
                  "Commit skill cards from hand (optional)",
                  "Reveal chaos token from bag",
                  "Apply token modifier to your stat",
                  "Compare total to difficulty — succeed or fail",
                ].map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="step-number flex-shrink-0" style={{ width: 24, height: 24, fontSize: 11, minWidth: 24 }}>{i + 1}</div>
                    <p className="text-ark-text-dim text-xs leading-relaxed pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Round structure */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(124,92,191,0.08)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Round Structure</h3>
              </div>
              <div className="px-4 py-3 space-y-2" style={{ background: "rgba(26,20,16,0.6)" }}>
                {[
                  { phase: "1. Mythos", color: "#7c5cbf", desc: "Doom advances, enemies spawn, encounter cards trigger. Skip Round 1." },
                  { phase: "2. Investigation", color: "#4a8fd4", desc: "Each investigator takes 3 actions in sequence." },
                  { phase: "3. Enemy", color: "#c0392b", desc: "Enemies hunt and attack automatically." },
                  { phase: "4. Upkeep", color: "#3a9e6b", desc: "Ready exhausted cards, draw 1 card, gain 1 resource." },
                ].map(p => (
                  <div key={p.phase} className="flex gap-3">
                    <span className="text-xs font-decorative font-bold w-32 flex-shrink-0" style={{ color: p.color }}>{p.phase}</span>
                    <p className="text-ark-text-muted text-xs">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </>
  );
}
