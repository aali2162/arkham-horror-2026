"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import ArkIcon from "@/components/ui/ArkIcon";
import { getSessionByCode, getPlayers, subscribeToPlayers, addPlayer, removePlayer, updatePlayerStat } from "@/lib/session";
import { GameSession, GamePlayer } from "@/types";
import { investigators } from "@/data/investigators";

// ─── Action definitions ───────────────────────────────────────────────────
const ACTIONS = [
  { id: "investigate", icon: "investigate" as const, label: "Investigate", color: "#6aabf7", bg: "rgba(106,171,247,0.08)", desc: "Test Intellect to collect clues" },
  { id: "move",        icon: "move"        as const, label: "Move",        color: "#5bbf8a", bg: "rgba(91,191,138,0.08)",  desc: "Move to a connecting location" },
  { id: "fight",       icon: "fight"       as const, label: "Fight",       color: "#d96b6b", bg: "rgba(217,107,107,0.08)", desc: "Attack an enemy at your location" },
  { id: "evade",       icon: "evade"       as const, label: "Evade",       color: "#e8a84a", bg: "rgba(232,168,74,0.08)",  desc: "Disengage from an enemy" },
  { id: "engage",      icon: "engage"      as const, label: "Engage",      color: "#d96b6b", bg: "rgba(217,107,107,0.08)", desc: "Engage an enemy at your location" },
  { id: "draw",        icon: "draw"        as const, label: "Draw",        color: "#a888e8", bg: "rgba(168,136,232,0.08)", desc: "Draw 1 card from your deck" },
  { id: "resource",    icon: "resource"    as const, label: "Resource",    color: "#c9973a", bg: "rgba(201,151,58,0.08)",  desc: "Gain 1 resource" },
  { id: "play",        icon: "play"        as const, label: "Play Card",   color: "#6aabf7", bg: "rgba(106,171,247,0.08)", desc: "Play an asset, event, or skill" },
  { id: "activate",    icon: "activate"    as const, label: "Activate",    color: "#a888e8", bg: "rgba(168,136,232,0.08)", desc: "Use an ability on a card in play" },
  { id: "resign",      icon: "resign"      as const, label: "Resign",      color: "#7a7060", bg: "rgba(122,112,96,0.08)",  desc: "Escape the scenario safely" },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────
interface ActionLog {
  id: string;
  playerName: string;
  investigator: string;
  action: string;
  actionIconId: typeof ACTIONS[number]["icon"] | "endturn";
  detail: string;
  timestamp: Date;
  round: number;
  actionNum: number;
}

interface TurnState {
  currentPlayerIdx: number;
  actionsUsed: number;
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

  const [turnState, setTurnState] = useState<TurnState>({
    currentPlayerIdx: 0,
    actionsUsed: 0,
    round: 1,
    phase: "investigation",
  });

  const [actionLog, setActionLog] = useState<ActionLog[]>([]);
  const [selectedAction, setSelectedAction] = useState<typeof ACTIONS[number] | null>(null);
  const [actionDetail, setActionDetail] = useState("");
  const [activeTab, setActiveTab] = useState<"board" | "log" | "reference">("board");
  const [flashStats, setFlashStats] = useState<Record<string, string>>({});

  const loadSession = useCallback(async () => {
    if (!sessionCode) return;
    const s = await getSessionByCode(sessionCode);
    if (!s) { setError(`Session "${sessionCode}" not found.`); setLoading(false); return; }
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
      actionIconId: selectedAction.icon,
      detail: actionDetail || selectedAction.desc,
      timestamp: new Date(),
      round: turnState.round,
      actionNum: turnState.actionsUsed + 1,
    };
    setActionLog(prev => [log, ...prev]);
    const newActionsUsed = turnState.actionsUsed + 1;
    if (newActionsUsed >= 3) {
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
      actionIconId: "endturn",
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

  // ─── Loading ─────────────────────────────────────────────────────────────
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
            <p className="font-decorative font-bold text-lg mb-2" style={{ color: "#e07060" }}>Session Not Found</p>
            <p className="text-ark-text-muted text-sm">{error}</p>
          </div>
        </main>
      </>
    );
  }

  // ─── Main render ──────────────────────────────────────────────────────────
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
              <span style={{ color: "#5bbf8a" }}>Live</span>
            </div>
            <button onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}>
              <ArkIcon id={copied ? "check" : "share"} size={13} />
              {copied ? "Copied!" : "Share Link"}
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: "rgba(26,20,16,0.8)", border: "1px solid #3d3020" }}>
          {([
            { id: "board",     icon: "board"     as const, label: "Board" },
            { id: "log",       icon: "log"       as const, label: "Action Log" },
            { id: "reference", icon: "reference" as const, label: "Reference" },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-decorative tracking-wide transition-all duration-200"
              style={activeTab === tab.id
                ? { background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#0a0805", boxShadow: "0 2px 8px rgba(201,151,58,0.3)" }
                : { color: "#6b5840" }}>
              <ArkIcon id={tab.icon} size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* ── BOARD TAB ─────────────────────────── */}
        {activeTab === "board" && (
          <div className="space-y-5">

            {/* Active turn banner */}
            {currentPlayer && players.length > 0 && (
              <div className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(201,151,58,0.07), rgba(18,14,9,0.95))", border: "1px solid rgba(201,151,58,0.25)" }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at left, rgba(201,151,58,0.05), transparent 60%)" }} />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-decorative font-bold text-sm text-[#0a0805]"
                    style={{ background: "linear-gradient(135deg, #c9973a, #a07828)", boxShadow: "0 0 12px rgba(201,151,58,0.3)" }}>
                    {currentPlayer.investigator[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted">Active Investigator</p>
                    <p className="font-decorative font-bold text-base text-ark-text">{currentPlayer.player_name}</p>
                    <p className="text-ark-text-muted text-xs">{currentPlayer.investigator}</p>
                  </div>
                </div>
                <div className="relative flex items-center gap-3">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300"
                        style={i < (3 - turnState.actionsUsed)
                          ? { background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#0a0805", boxShadow: "0 0 8px rgba(201,151,58,0.35)" }
                          : { background: "rgba(61,48,32,0.3)", border: "1px solid #3d3020", color: "#3d3020" }}>
                        {i < (3 - turnState.actionsUsed) ? "●" : "○"}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-ark-text-muted font-decorative">
                    <span className="font-bold text-ark-text">{3 - turnState.actionsUsed}</span> left
                  </span>
                  <button onClick={handleEndTurn}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-decorative tracking-wide transition-all"
                    style={{ background: "rgba(61,48,32,0.5)", border: "1px solid #4a3820", color: "#9a8870" }}>
                    <ArkIcon id="endturn" size={13} />
                    End Turn
                  </button>
                </div>
              </div>
            )}

            {/* Action grid */}
            {currentPlayer && players.length > 0 && (
              <div>
                <h3 className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted mb-3">
                  Log an Action — {currentPlayer.player_name}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ACTIONS.map(action => (
                    <button key={action.id}
                      onClick={() => setSelectedAction(action)}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all duration-200 hover:-translate-y-0.5"
                      style={{ background: action.bg, border: `1px solid ${action.color}25` }}>
                      <ArkIcon id={action.icon} size={22} color={action.color} />
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
                style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
                onClick={e => { if (e.target === e.currentTarget) setSelectedAction(null); }}>
                <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
                  style={{ background: "#1a1410", border: `1px solid ${selectedAction.color}30`, boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 30px ${selectedAction.color}10` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: selectedAction.bg, border: `1px solid ${selectedAction.color}30` }}>
                      <ArkIcon id={selectedAction.icon} size={24} color={selectedAction.color} />
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
                      className="btn-gold flex-1 py-2.5 text-sm rounded-lg">Log Action</button>
                  </div>
                </div>
              </div>
            )}

            {/* Player cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted">Investigators</h3>
                <button onClick={() => setShowAddPlayer(!showAddPlayer)}
                  className="text-xs font-semibold font-decorative px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(201,151,58,0.08)", border: "1px solid rgba(201,151,58,0.25)", color: "#c9973a" }}>
                  + Add Investigator
                </button>
              </div>

              {showAddPlayer && (
                <div className="rounded-xl p-4 mb-4 space-y-3"
                  style={{ background: "rgba(26,20,16,0.8)", border: "1px solid rgba(201,151,58,0.2)" }}>
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
                    <button onClick={() => setShowAddPlayer(false)} className="btn-ghost flex-1 py-2 text-sm rounded-lg">Cancel</button>
                    <button onClick={handleAddPlayer} disabled={addingPlayer || !addingName.trim()}
                      className="btn-gold flex-1 py-2 text-sm rounded-lg disabled:opacity-40">
                      {addingPlayer ? "Adding…" : "Add to Session"}
                    </button>
                  </div>
                </div>
              )}

              {players.length === 0 ? (
                <div className="rounded-xl p-10 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed #3d3020" }}>
                  <ArkIcon id="players" size={36} color="#4a3828" className="mx-auto mb-3" />
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
                          border: isActive ? "1px solid rgba(201,151,58,0.4)" : "1px solid #3d3020",
                          boxShadow: isActive ? "0 0 18px rgba(201,151,58,0.08), 0 4px 20px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.4)",
                        }}>

                        {isActive && (
                          <div className="absolute -top-px left-4 right-4 h-px rounded-full"
                            style={{ background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.6), transparent)" }} />
                        )}

                        <button onClick={() => handleRemove(player)}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full text-xs opacity-0 hover:opacity-100 transition-all"
                          style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.25)", color: "#d96b6b" }}>
                          ✕
                        </button>

                        <div className="flex items-center gap-2 mb-3" style={{ paddingRight: "28px" }}>
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-decorative font-bold text-sm flex-shrink-0"
                            style={{ background: isActive ? "linear-gradient(135deg, #c9973a, #a07828)" : "rgba(61,48,32,0.5)", color: isActive ? "#0a0805" : "#8a6030", border: isActive ? "none" : "1px solid #4a3820" }}>
                            {player.investigator[0]}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-decorative font-bold text-sm text-ark-text truncate">{player.player_name}</p>
                              {isActive && <span className="text-[9px] font-decorative px-1.5 py-0.5 rounded" style={{ background: "rgba(201,151,58,0.15)", color: "#c9973a" }}>ACTIVE</span>}
                            </div>
                            <p className="text-[11px] text-ark-text-muted truncate">{player.investigator}</p>
                          </div>
                        </div>

                        {(isDefeated || isInsane) && (
                          <div className="mb-2 px-2 py-1 rounded text-[10px] font-decorative font-bold text-center"
                            style={{ background: isDefeated ? "rgba(192,57,43,0.15)" : "rgba(124,92,191,0.15)", color: isDefeated ? "#d96b6b" : "#a888e8", border: `1px solid ${isDefeated ? "rgba(192,57,43,0.3)" : "rgba(124,92,191,0.3)"}` }}>
                            {isDefeated ? "DEFEATED" : "INSANE"}
                          </div>
                        )}

                        {/* Damage */}
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                              <ArkIcon id="health" size={11} color="#d96b6b" />
                              <span className="text-[11px]" style={{ color: "#c06060" }}>
                                {player.damage} / {inv?.health ?? 9}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleStatChange(player, "damage", -1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all hover:brightness-125"
                                style={{ background: "rgba(192,57,43,0.1)", color: "#d96b6b", border: "1px solid rgba(192,57,43,0.2)" }}>−</button>
                              <button onClick={() => handleStatChange(player, "damage", 1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all hover:brightness-125"
                                style={{ background: "rgba(192,57,43,0.1)", color: "#d96b6b", border: "1px solid rgba(192,57,43,0.2)" }}>+</button>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(192,57,43,0.1)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${healthPct}%`, background: "linear-gradient(90deg, #8e1a0e, #c05050)" }} />
                          </div>
                        </div>

                        {/* Horror */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                              <ArkIcon id="sanity" size={11} color="#a888e8" />
                              <span className="text-[11px]" style={{ color: "#9070c0" }}>
                                {player.horror} / {inv?.sanity ?? 7}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleStatChange(player, "horror", -1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all hover:brightness-125"
                                style={{ background: "rgba(124,92,191,0.1)", color: "#a888e8", border: "1px solid rgba(124,92,191,0.2)" }}>−</button>
                              <button onClick={() => handleStatChange(player, "horror", 1)}
                                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-all hover:brightness-125"
                                style={{ background: "rgba(124,92,191,0.1)", color: "#a888e8", border: "1px solid rgba(124,92,191,0.2)" }}>+</button>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(124,92,191,0.1)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${sanityPct}%`, background: "linear-gradient(90deg, #4a3578, #8868c8)" }} />
                          </div>
                        </div>

                        {/* Resources */}
                        <div className="flex items-center justify-between pt-2.5 mb-2.5" style={{ borderTop: "1px solid #2e2318" }}>
                          <div className="flex items-center gap-1.5">
                            <ArkIcon id="resource" size={11} color="#a07828" />
                            <span className="text-[10px] font-decorative text-ark-text-muted uppercase tracking-wider">Resources</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleStatChange(player, "resources", -1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all hover:brightness-125"
                              style={{ background: "rgba(201,151,58,0.08)", color: "#c9973a", border: "1px solid rgba(201,151,58,0.2)" }}>−</button>
                            <span className="font-mono font-bold text-base w-6 text-center" style={{ color: "#c9973a" }}>
                              {player.resources}
                            </span>
                            <button onClick={() => handleStatChange(player, "resources", 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-sm font-bold transition-all hover:brightness-125"
                              style={{ background: "rgba(201,151,58,0.08)", color: "#c9973a", border: "1px solid rgba(201,151,58,0.2)" }}>+</button>
                          </div>
                        </div>

                        {/* Stats */}
                        {inv && (
                          <div className="grid grid-cols-4 gap-1 pt-2.5" style={{ borderTop: "1px solid #2e2318" }}>
                            {[
                              { label: "WIL", val: inv.willpower,  color: "#a888e8" },
                              { label: "INT", val: inv.intellect,  color: "#6aabf7" },
                              { label: "COM", val: inv.combat,     color: "#d96b6b" },
                              { label: "AGI", val: inv.agility,    color: "#5bbf8a" },
                            ].map(s => (
                              <div key={s.label} className="text-center py-1.5 rounded" style={{ background: "rgba(10,8,5,0.35)" }}>
                                <div className="text-[9px] text-ark-text-muted font-decorative tracking-wide">{s.label}</div>
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

        {/* ── ACTION LOG TAB ─────────────────────────────────────────────── */}
        {activeTab === "log" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ark-text-muted font-decorative">{actionLog.length} action{actionLog.length !== 1 ? "s" : ""} logged</p>
              {actionLog.length > 0 && (
                <button onClick={() => setActionLog([])} className="text-xs text-ark-text-muted hover:text-ark-text transition-colors">
                  Clear log
                </button>
              )}
            </div>

            {actionLog.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed #3d3020" }}>
                <ArkIcon id="log" size={36} color="#4a3828" className="mx-auto mb-3" />
                <p className="text-ark-text-muted text-sm">No actions logged yet. Use the Board tab to log actions.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {actionLog.map(entry => {
                  const actionDef = ACTIONS.find(a => a.label === entry.action);
                  const iconId = entry.actionIconId === "endturn" ? "endturn" : (entry.actionIconId as typeof ACTIONS[number]["icon"]);
                  return (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(26,20,16,0.7)", border: "1px solid #2e2318" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: actionDef ? actionDef.bg : "rgba(61,48,32,0.4)", border: `1px solid ${actionDef?.color ?? "#3d3020"}20` }}>
                        <ArkIcon id={iconId} size={18} color={actionDef?.color ?? "#9a8870"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-decorative font-bold text-sm text-ark-text">{entry.playerName}</span>
                          <span className="text-ark-text-muted text-xs">·</span>
                          <span className="text-xs font-semibold" style={{ color: actionDef?.color ?? "#c9973a" }}>
                            {entry.action}
                          </span>
                          <span className="text-ark-text-muted text-xs ml-auto">R{entry.round} · Act {entry.actionNum}</span>
                        </div>
                        <p className="text-ark-text-muted text-xs mt-0.5">{entry.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── REFERENCE TAB ──────────────────────────────────────────────── */}
        {activeTab === "reference" && (
          <div className="space-y-5">

            {/* Actions reference */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(201,151,58,0.06)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Investigation Actions</h3>
                <p className="text-ark-text-muted text-xs">Each investigator takes 3 actions per turn</p>
              </div>
              <div className="divide-y divide-ark-border">
                {ACTIONS.map(action => (
                  <div key={action.id} className="flex items-center gap-3 px-4 py-3"
                    style={{ background: "rgba(26,20,16,0.6)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: action.bg, border: `1px solid ${action.color}20` }}>
                      <ArkIcon id={action.icon} size={17} color={action.color} />
                    </div>
                    <div>
                      <span className="font-decorative font-semibold text-sm" style={{ color: action.color }}>{action.label}</span>
                      <p className="text-ark-text-muted text-xs">{action.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill test */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(106,171,247,0.06)", borderBottom: "1px solid #3d3020" }}>
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
              <div className="px-4 py-3" style={{ background: "rgba(168,136,232,0.06)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Round Structure</h3>
              </div>
              <div className="px-4 py-3 space-y-2" style={{ background: "rgba(26,20,16,0.6)" }}>
                {[
                  { phase: "1. Mythos",        color: "#a888e8", desc: "Doom advances, enemies spawn, encounter cards trigger. Skip Round 1." },
                  { phase: "2. Investigation", color: "#6aabf7", desc: "Each investigator takes 3 actions in sequence." },
                  { phase: "3. Enemy",         color: "#d96b6b", desc: "Unengaged enemies hunt and move. Engaged enemies attack." },
                  { phase: "4. Upkeep",        color: "#5bbf8a", desc: "Ready exhausted cards, draw 1 card, gain 1 resource, enforce hand limit." },
                ].map(row => (
                  <div key={row.phase} className="flex gap-3 items-start py-1">
                    <span className="text-xs font-decorative font-bold flex-shrink-0 w-28" style={{ color: row.color }}>{row.phase}</span>
                    <p className="text-ark-text-muted text-xs leading-relaxed">{row.desc}</p>
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
