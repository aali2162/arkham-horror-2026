"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import ArkIcon from "@/components/ui/ArkIcon";
import { getSessionByCode, getPlayers, subscribeToPlayers, addPlayer, removePlayer, updatePlayerStat } from "@/lib/session";
import { GameSession, GamePlayer } from "@/types";
import { investigators } from "@/data/investigators";

// ─── Investigator class colours ──────────────────────────────────────────────
const CLASS_COLORS: Record<string, { hex: string; bg: string; border: string; glow: string }> = {
  Guardian: { hex: "#4a8fd4", bg: "rgba(74,143,212,0.10)", border: "rgba(74,143,212,0.35)", glow: "rgba(74,143,212,0.18)" },
  Seeker:   { hex: "#d4922a", bg: "rgba(212,146,42,0.10)",  border: "rgba(212,146,42,0.35)",  glow: "rgba(212,146,42,0.18)"  },
  Rogue:    { hex: "#3a9e6b", bg: "rgba(58,158,107,0.10)",  border: "rgba(58,158,107,0.35)",  glow: "rgba(58,158,107,0.18)"  },
  Mystic:   { hex: "#7c5cbf", bg: "rgba(124,92,191,0.10)",  border: "rgba(124,92,191,0.35)",  glow: "rgba(124,92,191,0.18)"  },
  Survivor: { hex: "#c0392b", bg: "rgba(192,57,43,0.10)",   border: "rgba(192,57,43,0.35)",   glow: "rgba(192,57,43,0.18)"   },
};

// ─── Enemy keywords ──────────────────────────────────────────────────────────
const ENEMY_KEYWORDS = [
  { key: "Hunter",   color: "#d96b6b", desc: "Moves toward nearest investigator each Enemy Phase" },
  { key: "Alert",    color: "#e8a84a", desc: "Attacks if you fail evasion — even if not engaged" },
  { key: "Retaliate",color: "#d96b6b", desc: "Attacks if you fail a Fight test against it" },
  { key: "Aloof",    color: "#a888e8", desc: "Won't auto-engage. Must use Engage action to fight it" },
  { key: "Elusive",  color: "#5bbf8a", desc: "Flees to connecting location after being attacked" },
  { key: "Massive",  color: "#e8a84a", desc: "Engaged with ALL investigators at its location" },
  { key: "Patrol",   color: "#6aabf7", desc: "Moves toward its designated target each Enemy Phase" },
  { key: "Doomed",   color: "#c9973a", desc: "When defeated, place 1 doom on current agenda" },
];

// ─── Actions ─────────────────────────────────────────────────────────────────
const ACTIONS = [
  { id: "investigate", icon: "investigate" as const, label: "Investigate", color: "#6aabf7", bg: "rgba(106,171,247,0.08)", desc: "Test Intellect vs. location shroud to collect a clue" },
  { id: "move",        icon: "move"        as const, label: "Move",        color: "#5bbf8a", bg: "rgba(91,191,138,0.08)",  desc: "Move to a connecting location" },
  { id: "fight",       icon: "fight"       as const, label: "Fight",       color: "#d96b6b", bg: "rgba(217,107,107,0.08)", desc: "Test Combat vs. enemy Fight value — deal 1 damage on success" },
  { id: "evade",       icon: "evade"       as const, label: "Evade",       color: "#e8a84a", bg: "rgba(232,168,74,0.08)",  desc: "Test Agility vs. enemy Evade value — disengage and exhaust enemy" },
  { id: "engage",      icon: "engage"      as const, label: "Engage",      color: "#d96b6b", bg: "rgba(217,107,107,0.08)", desc: "Engage an enemy at your location (required for Aloof enemies)" },
  { id: "draw",        icon: "draw"        as const, label: "Draw",        color: "#a888e8", bg: "rgba(168,136,232,0.08)", desc: "Draw 1 card from your deck" },
  { id: "resource",    icon: "resource"    as const, label: "Resource",    color: "#c9973a", bg: "rgba(201,151,58,0.08)",  desc: "Gain 1 resource from the token pool" },
  { id: "play",        icon: "play"        as const, label: "Play Card",   color: "#6aabf7", bg: "rgba(106,171,247,0.08)", desc: "Pay cost and play an Asset, Event, or Skill from hand" },
  { id: "activate",    icon: "activate"    as const, label: "Activate",    color: "#a888e8", bg: "rgba(168,136,232,0.08)", desc: "Use an ⚡ ability on a card you control" },
  { id: "resign",      icon: "resign"      as const, label: "Resign",      color: "#7a7060", bg: "rgba(122,112,96,0.08)",  desc: "Escape the scenario safely at a resign location" },
] as const;

// ─── Chaos tokens ─────────────────────────────────────────────────────────────
const CHAOS_TOKENS = [
  { token: "+1",        mod: "+1",    color: "#5bbf8a", note: "Bless this investigator" },
  { token: "0",         mod: "0",     color: "#8a8070", note: "No modifier" },
  { token: "0",         mod: "0",     color: "#8a8070", note: "No modifier" },
  { token: "−1",        mod: "−1",    color: "#e8a84a", note: "Slight setback" },
  { token: "−1",        mod: "−1",    color: "#e8a84a", note: "Slight setback" },
  { token: "−1",        mod: "−1",    color: "#e8a84a", note: "Slight setback" },
  { token: "−1",        mod: "−1",    color: "#e8a84a", note: "Slight setback" },
  { token: "−2",        mod: "−2",    color: "#d98a40", note: "Significant setback" },
  { token: "−2",        mod: "−2",    color: "#d98a40", note: "Significant setback" },
  { token: "−3",        mod: "−3",    color: "#d96b6b", note: "Major setback" },
  { token: "−4",        mod: "−4",    color: "#c05050", note: "Severe setback" },
  { token: "Skull",     mod: "?",     color: "#8a7060", note: "Check scenario reference card" },
  { token: "Cultist",   mod: "?",     color: "#8a7060", note: "Check scenario reference card" },
  { token: "Tablet",    mod: "?",     color: "#8a7060", note: "Check scenario reference card" },
  { token: "Elder Thing", mod: "?",   color: "#8a7060", note: "Check scenario reference card" },
  { token: "Elder Sign", mod: "★",    color: "#c9973a", note: "Trigger investigator's Elder Sign ability" },
  { token: "Autofail",  mod: "✕",     color: "#c03020", note: "Automatic failure — no modifiers apply" },
];

// ─── Easily missed rules ──────────────────────────────────────────────────────
const MISSED_RULES = [
  { title: "Attacks of Opportunity", desc: "If engaged with a ready enemy, taking any action other than Fight, Evade, Parley, or Resign triggers an immediate attack from every engaged enemy." },
  { title: "Combat Damage", desc: "A successful attack deals only 1 damage by default unless a card says otherwise." },
  { title: "Playing Assets", desc: "You can only play an asset on your turn (unless it has the Fast keyword)." },
  { title: "Committing Cards", desc: "Committing a skill card to a test is free — it does not cost resources. Only matching skill icons count toward the test." },
  { title: "Help Another Investigator", desc: "You can commit 1 card max to another investigator's skill test, but only if you're at the same location." },
  { title: "Cannot is Absolute", desc: "Any effect with the word 'cannot' cannot be overridden by any other card or rule." },
  { title: "Enemies Spawn Engaged", desc: "Unless the enemy has the Aloof keyword, an enemy drawn from the encounter deck spawns engaged with the investigator who drew it." },
  { title: "Autofail Token", desc: "The tentacle token is an automatic failure. No modifiers apply. Your skill value is treated as 0 for 'fail by X' effects." },
  { title: "Forced Abilities Over Player Abilities", desc: "'Forced –' effects take priority over player-triggered abilities during timing conflicts." },
  { title: "Threat Area Treacheries", desc: "You may trigger reaction (⟳) abilities on treacheries in other investigators' threat areas if you're at the same location." },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface Enemy {
  id: string;
  name: string;
  fightVal: number;
  evadeVal: number;
  health: number;
  damage: number;
  horror: number;
  currentDamage: number;
  keywords: string[];
  engagedPlayerId: string;
}

interface Treachery {
  id: string;
  name: string;
  effect: string;
  playerId: string;
}

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
  leadInvestigatorIdx: number;
}

interface PlayerExtras {
  [playerId: string]: {
    clues: number;
    xp: number;
  };
}

// ─── Component ────────────────────────────────────────────────────────────────
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
    leadInvestigatorIdx: 0,
  });

  const [actionLog, setActionLog] = useState<ActionLog[]>([]);
  const [selectedAction, setSelectedAction] = useState<typeof ACTIONS[number] | null>(null);
  const [actionDetail, setActionDetail] = useState("");
  const [activeTab, setActiveTab] = useState<"board" | "enemies" | "log" | "reference">("board");

  // Doom tracker
  const [doom, setDoom] = useState(0);
  const [doomThreshold, setDoomThreshold] = useState(3);
  const [agendaName, setAgendaName] = useState("Past Curfew");
  const [actName, setActName] = useState("Where There's Smoke…");
  const [cluesRequired, setCluesRequired] = useState(2);

  // Enemies & treacheries
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [treacheries, setTreacheries] = useState<Treachery[]>([]);
  const [showAddEnemy, setShowAddEnemy] = useState(false);
  const [newEnemy, setNewEnemy] = useState({ name: "", fightVal: 3, evadeVal: 3, health: 3, damage: 1, horror: 1, keywords: [] as string[], engagedPlayerId: "" });
  const [showAddTreachery, setShowAddTreachery] = useState(false);
  const [newTreachery, setNewTreachery] = useState({ name: "", effect: "", playerId: "" });

  // Per-player extras (clues, XP — local state only)
  const [playerExtras, setPlayerExtras] = useState<PlayerExtras>({});

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

  // Initialise extras for new players
  useEffect(() => {
    setPlayerExtras(prev => {
      const next = { ...prev };
      players.forEach(p => {
        if (!next[p.id]) next[p.id] = { clues: 0, xp: 0 };
      });
      return next;
    });
  }, [players]);

  const currentPlayer = players[turnState.currentPlayerIdx] ?? null;
  const leadPlayer = players[turnState.leadInvestigatorIdx] ?? null;

  const updateExtra = (playerId: string, field: "clues" | "xp", delta: number) => {
    setPlayerExtras(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [field]: Math.max(0, (prev[playerId]?.[field] ?? 0) + delta) },
    }));
  };

  const handleStatChange = async (player: GamePlayer, field: "damage" | "horror" | "resources", delta: number) => {
    const newVal = Math.max(0, player[field] + delta);
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
      const nextIdx = (turnState.currentPlayerIdx + 1) % Math.max(1, players.length);
      const newRound = nextIdx === 0 ? turnState.round + 1 : turnState.round;
      setTurnState(prev => ({ ...prev, currentPlayerIdx: nextIdx, actionsUsed: 0, round: newRound }));
    } else {
      setTurnState(prev => ({ ...prev, actionsUsed: newActionsUsed }));
    }
    setSelectedAction(null);
    setActionDetail("");
  };

  const handleEndTurn = () => {
    if (!currentPlayer) return;
    const nextIdx = (turnState.currentPlayerIdx + 1) % Math.max(1, players.length);
    const newRound = nextIdx === 0 ? turnState.round + 1 : turnState.round;
    setTurnState(prev => ({ ...prev, currentPlayerIdx: nextIdx, actionsUsed: 0, round: newRound }));
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

  const handleAddEnemy = () => {
    if (!newEnemy.name.trim()) return;
    const enemy: Enemy = {
      id: `enemy-${Date.now()}`,
      name: newEnemy.name.trim(),
      fightVal: newEnemy.fightVal,
      evadeVal: newEnemy.evadeVal,
      health: newEnemy.health,
      damage: newEnemy.damage,
      horror: newEnemy.horror,
      currentDamage: 0,
      keywords: newEnemy.keywords,
      engagedPlayerId: newEnemy.engagedPlayerId || (players[0]?.id ?? ""),
    };
    setEnemies(prev => [...prev, enemy]);
    setNewEnemy({ name: "", fightVal: 3, evadeVal: 3, health: 3, damage: 1, horror: 1, keywords: [], engagedPlayerId: "" });
    setShowAddEnemy(false);
  };

  const handleEnemyDamage = (enemyId: string, delta: number) => {
    setEnemies(prev => prev.map(e => {
      if (e.id !== enemyId) return e;
      const next = { ...e, currentDamage: Math.max(0, e.currentDamage + delta) };
      return next;
    }));
    setEnemies(prev => prev.filter(e => e.currentDamage < e.health));
  };

  const handleDefeatEnemy = (enemyId: string) => {
    const enemy = enemies.find(e => e.id === enemyId);
    if (enemy?.keywords.includes("Doomed")) setDoom(d => d + 1);
    setEnemies(prev => prev.filter(e => e.id !== enemyId));
  };

  const handleAddTreachery = () => {
    if (!newTreachery.name.trim()) return;
    const t: Treachery = {
      id: `treachery-${Date.now()}`,
      name: newTreachery.name.trim(),
      effect: newTreachery.effect,
      playerId: newTreachery.playerId || (players[0]?.id ?? ""),
    };
    setTreacheries(prev => [...prev, t]);
    setNewTreachery({ name: "", effect: "", playerId: "" });
    setShowAddTreachery(false);
  };

  const toggleEnemyKeyword = (keyword: string) => {
    setNewEnemy(prev => ({
      ...prev,
      keywords: prev.keywords.includes(keyword)
        ? prev.keywords.filter(k => k !== keyword)
        : [...prev.keywords, keyword],
    }));
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

  const doomPct = Math.min((doom / Math.max(1, doomThreshold)) * 100, 100);
  const doomDanger = doom >= doomThreshold;

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <BackButton href="/play" label="All Sessions" />

        {/* ── Session header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div className="flex items-center gap-4 flex-wrap">
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
              <p className="text-ark-text-muted text-[10px] uppercase tracking-widest font-decorative">Investigators</p>
              <p className="font-decorative font-bold text-xl text-ark-text">{players.length}</p>
            </div>
            {/* Doom compact display */}
            <div className="h-8 w-px" style={{ background: "#3d3020" }} />
            <div>
              <p className="text-ark-text-muted text-[10px] uppercase tracking-widest font-decorative">Doom</p>
              <p className="font-decorative font-bold text-xl" style={{ color: doomDanger ? "#d96b6b" : "#a888e8" }}>
                {doom}<span className="text-sm font-normal text-ark-text-muted">/{doomThreshold}</span>
              </p>
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

        {/* ── Doom & Agenda Bar ── */}
        <div className="rounded-xl p-4 mb-5"
          style={{ background: "linear-gradient(135deg, rgba(124,92,191,0.07), rgba(10,8,5,0.95))", border: `1px solid ${doomDanger ? "rgba(192,57,43,0.4)" : "rgba(124,92,191,0.3)"}` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Doom tracker */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <ArkIcon id="doom" size={14} color={doomDanger ? "#d96b6b" : "#a888e8"} />
                  <span className="font-decorative font-bold text-xs uppercase tracking-wider" style={{ color: doomDanger ? "#d96b6b" : "#a888e8" }}>
                    Doom Track — {agendaName}
                  </span>
                  {doomDanger && (
                    <span className="text-[9px] font-decorative px-2 py-0.5 rounded-full animate-pulse"
                      style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", color: "#d96b6b" }}>
                      AGENDA ADVANCES
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs" style={{ color: doomDanger ? "#d96b6b" : "#a888e8" }}>{doom} / {doomThreshold}</span>
              </div>
              {/* Doom pips */}
              <div className="flex gap-1 mb-2 flex-wrap">
                {Array.from({ length: doomThreshold }).map((_, i) => (
                  <button key={i}
                    onClick={() => setDoom(i < doom ? i : i + 1)}
                    className="w-7 h-7 rounded flex items-center justify-center transition-all duration-300"
                    style={i < doom
                      ? { background: doomDanger ? "rgba(192,57,43,0.6)" : "rgba(124,92,191,0.6)", border: `1px solid ${doomDanger ? "#d96b6b" : "#7c5cbf"}`, boxShadow: `0 0 8px ${doomDanger ? "rgba(192,57,43,0.3)" : "rgba(124,92,191,0.3)"}` }
                      : { background: "rgba(26,20,16,0.6)", border: "1px solid #3d3020" }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: i < doom ? (doomDanger ? "#d96b6b" : "#a888e8") : "#2e2318" }} />
                  </button>
                ))}
                {/* +/- controls */}
                <div className="flex items-center gap-1 ml-2">
                  <button onClick={() => setDoom(d => Math.max(0, d - 1))}
                    className="w-7 h-7 rounded text-sm font-bold transition-all"
                    style={{ background: "rgba(124,92,191,0.1)", border: "1px solid rgba(124,92,191,0.25)", color: "#a888e8" }}>−</button>
                  <button onClick={() => setDoom(d => d + 1)}
                    className="w-7 h-7 rounded text-sm font-bold transition-all"
                    style={{ background: "rgba(124,92,191,0.1)", border: "1px solid rgba(124,92,191,0.25)", color: "#a888e8" }}>+</button>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(124,92,191,0.12)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${doomPct}%`, background: doomDanger ? "linear-gradient(90deg, #8e1a0e, #c05050)" : "linear-gradient(90deg, #4a3578, #9070c0)" }} />
              </div>
            </div>

            <div className="w-px h-12 hidden sm:block" style={{ background: "#3d3020" }} />

            {/* Agenda / Act info */}
            <div className="flex gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-[10px] font-decorative uppercase tracking-wider" style={{ color: "#a888e8" }}>Current Agenda</p>
                <input value={agendaName} onChange={e => setAgendaName(e.target.value)}
                  className="ark-input px-2 py-1 rounded text-xs w-36" style={{ fontSize: "11px" }} />
                <div className="flex items-center gap-2">
                  <span className="text-ark-text-muted text-[10px]">Threshold:</span>
                  <button onClick={() => setDoomThreshold(d => Math.max(1, d - 1))} className="w-5 h-5 rounded text-xs font-bold" style={{ background: "rgba(124,92,191,0.1)", color: "#a888e8", border: "1px solid rgba(124,92,191,0.2)" }}>−</button>
                  <span className="font-mono text-sm font-bold" style={{ color: "#a888e8" }}>{doomThreshold}</span>
                  <button onClick={() => setDoomThreshold(d => d + 1)} className="w-5 h-5 rounded text-xs font-bold" style={{ background: "rgba(124,92,191,0.1)", color: "#a888e8", border: "1px solid rgba(124,92,191,0.2)" }}>+</button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-decorative uppercase tracking-wider" style={{ color: "#6aabf7" }}>Current Act</p>
                <input value={actName} onChange={e => setActName(e.target.value)}
                  className="ark-input px-2 py-1 rounded text-xs w-36" style={{ fontSize: "11px" }} />
                <div className="flex items-center gap-2">
                  <span className="text-ark-text-muted text-[10px]">Clues needed:</span>
                  <button onClick={() => setCluesRequired(d => Math.max(1, d - 1))} className="w-5 h-5 rounded text-xs font-bold" style={{ background: "rgba(106,171,247,0.1)", color: "#6aabf7", border: "1px solid rgba(106,171,247,0.2)" }}>−</button>
                  <span className="font-mono text-sm font-bold" style={{ color: "#6aabf7" }}>{cluesRequired}</span>
                  <button onClick={() => setCluesRequired(d => d + 1)} className="w-5 h-5 rounded text-xs font-bold" style={{ background: "rgba(106,171,247,0.1)", color: "#6aabf7", border: "1px solid rgba(106,171,247,0.2)" }}>+</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: "rgba(26,20,16,0.8)", border: "1px solid #3d3020" }}>
          {([
            { id: "board",     icon: "board"     as const, label: "Board" },
            { id: "enemies",   icon: "fight"     as const, label: "Enemies" },
            { id: "log",       icon: "log"       as const, label: "Log" },
            { id: "reference", icon: "reference" as const, label: "Reference" },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-decorative tracking-wide transition-all duration-200 whitespace-nowrap"
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

            {/* ── Lead Investigator Panel ── */}
            {leadPlayer && players.length > 0 && (
              <div className="rounded-xl p-4 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(201,151,58,0.07), rgba(10,8,5,0.95))", border: "1px solid rgba(201,151,58,0.3)" }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.5), transparent)" }} />
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-3">
                    {/* Lead badge */}
                    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #c9973a, #8b6914)", boxShadow: "0 0 18px rgba(201,151,58,0.35)" }}>
                      <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current" style={{ color: "#0a0805" }}>
                        <path d="M10 2L12.4 7.5H18L13.4 11L15.3 17L10 13.5L4.7 17L6.6 11L2 7.5H7.6L10 2Z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[10px] font-decorative uppercase tracking-widest" style={{ color: "#c9973a" }}>Lead Investigator</p>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-decorative" style={{ background: "rgba(201,151,58,0.15)", color: "#c9973a", border: "1px solid rgba(201,151,58,0.3)" }}>
                          Round {turnState.round}
                        </span>
                      </div>
                      <p className="font-decorative font-bold text-base text-ark-text">{leadPlayer.player_name}</p>
                      <p className="text-xs text-ark-text-muted">{leadPlayer.investigator}</p>
                    </div>
                  </div>

                  {/* Lead responsibilities */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { icon: "★", text: "Holds the Campaign Guide and Lead Token" },
                      { icon: "⚖", text: "Breaks all ties — always chooses the worst option (Grim Rule)" },
                      { icon: "↕", text: "Chooses player order at start of Investigation Phase" },
                      { icon: "⚡", text: "If card vs. card conflict, decides which takes precedence" },
                    ].map((r, i) => (
                      <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg"
                        style={{ background: "rgba(201,151,58,0.04)", border: "1px solid rgba(201,151,58,0.12)" }}>
                        <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: "#c9973a" }}>{r.icon}</span>
                        <span className="text-[11px] leading-tight" style={{ color: "#a89878" }}>{r.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Change lead */}
                  {players.length > 1 && (
                    <div className="flex flex-col justify-center gap-1">
                      <p className="text-[10px] font-decorative uppercase tracking-wider text-ark-text-muted">Change Lead</p>
                      <div className="flex flex-wrap gap-1">
                        {players.map((p, idx) => (
                          <button key={p.id}
                            onClick={() => setTurnState(prev => ({ ...prev, leadInvestigatorIdx: idx }))}
                            className="px-2 py-1 rounded text-[10px] font-decorative font-semibold transition-all"
                            style={idx === turnState.leadInvestigatorIdx
                              ? { background: "rgba(201,151,58,0.25)", border: "1px solid rgba(201,151,58,0.5)", color: "#c9973a" }
                              : { background: "transparent", border: "1px solid #3d3020", color: "#5a4838" }}>
                            {p.player_name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Active turn banner ── */}
            {currentPlayer && players.length > 0 && (
              <div className="rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(74,143,212,0.07), rgba(10,8,5,0.95))", border: "1px solid rgba(74,143,212,0.25)" }}>
                <div className="flex items-center gap-3">
                  {(() => {
                    const inv = investigators.find(i => i.name === currentPlayer.investigator);
                    const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                    return (
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-decorative font-bold text-sm flex-shrink-0"
                        style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex, boxShadow: `0 0 12px ${cls.glow}` }}>
                        {currentPlayer.investigator[0]}
                      </div>
                    );
                  })()}
                  <div>
                    <p className="text-[10px] font-decorative uppercase tracking-widest" style={{ color: "#6aabf7" }}>Active Investigator</p>
                    <p className="font-decorative font-bold text-base text-ark-text">{currentPlayer.player_name}</p>
                    <p className="text-[11px] text-ark-text-muted">{currentPlayer.investigator}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300"
                        style={i < (3 - turnState.actionsUsed)
                          ? { background: "linear-gradient(135deg, #4a8fd4, #2d6ea4)", color: "#fff", boxShadow: "0 0 8px rgba(74,143,212,0.4)" }
                          : { background: "rgba(26,20,16,0.6)", border: "1px solid #3d3020", color: "#3d3020" }}>
                        {i < (3 - turnState.actionsUsed) ? "●" : "○"}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-ark-text-muted font-decorative">
                    <span className="font-bold text-ark-text">{3 - turnState.actionsUsed}</span> action{3 - turnState.actionsUsed !== 1 ? "s" : ""} left
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

            {/* ── Action grid ── */}
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
                style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
                onClick={e => { if (e.target === e.currentTarget) setSelectedAction(null); }}>
                <div className="w-full max-w-md rounded-2xl p-6 space-y-4"
                  style={{ background: "#1a1410", border: `1px solid ${selectedAction.color}35`, boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${selectedAction.color}12` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: selectedAction.bg, border: `1px solid ${selectedAction.color}30` }}>
                      <ArkIcon id={selectedAction.icon} size={24} color={selectedAction.color} />
                    </div>
                    <div>
                      <h3 className="font-decorative font-bold text-lg text-ark-text">{selectedAction.label}</h3>
                      <p className="text-ark-text-muted text-xs leading-relaxed">{selectedAction.desc}</p>
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
                    <button onClick={() => setSelectedAction(null)} className="btn-ghost flex-1 py-2.5 text-sm rounded-lg">Cancel</button>
                    <button onClick={handleLogAction} className="btn-gold flex-1 py-2.5 text-sm rounded-lg">Log Action</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Investigator cards ── */}
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
                    const isLead = idx === turnState.leadInvestigatorIdx;
                    const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                    const healthPct = Math.min((player.damage / (inv?.health ?? 9)) * 100, 100);
                    const sanityPct = Math.min((player.horror / (inv?.sanity ?? 7)) * 100, 100);
                    const isDefeated = player.damage >= (inv?.health ?? 9);
                    const isInsane = player.horror >= (inv?.sanity ?? 7);
                    const extras = playerExtras[player.id] ?? { clues: 0, xp: 0 };
                    const engagedEnemies = enemies.filter(e => e.engagedPlayerId === player.id);

                    return (
                      <div key={player.id}
                        className="rounded-xl p-4 relative transition-all duration-300"
                        style={{
                          background: "linear-gradient(145deg, #1a1410, #120e09)",
                          border: isActive ? `1px solid ${cls.border}` : "1px solid #3d3020",
                          boxShadow: isActive ? `0 0 18px ${cls.glow}, 0 4px 20px rgba(0,0,0,0.4)` : "0 4px 16px rgba(0,0,0,0.4)",
                        }}>

                        {isActive && (
                          <div className="absolute -top-px left-4 right-4 h-px rounded-full"
                            style={{ background: `linear-gradient(90deg, transparent, ${cls.hex}80, transparent)` }} />
                        )}

                        {/* Remove button */}
                        <button onClick={() => handleRemove(player)}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full text-xs opacity-0 hover:opacity-100 transition-all"
                          style={{ background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.25)", color: "#d96b6b" }}>
                          ✕
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3" style={{ paddingRight: "28px" }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-decorative font-bold text-sm flex-shrink-0"
                            style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex, boxShadow: `0 0 10px ${cls.glow}` }}>
                            {player.investigator[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-decorative font-bold text-sm text-ark-text truncate">{player.player_name}</p>
                              {isActive && <span className="text-[9px] font-decorative px-1.5 py-0.5 rounded" style={{ background: `${cls.bg}`, color: cls.hex, border: `1px solid ${cls.border}` }}>ACTIVE</span>}
                              {isLead && <span className="text-[9px] font-decorative px-1.5 py-0.5 rounded" style={{ background: "rgba(201,151,58,0.15)", color: "#c9973a", border: "1px solid rgba(201,151,58,0.3)" }}>★ LEAD</span>}
                            </div>
                            <p className="text-[11px] text-ark-text-muted">{player.investigator}</p>
                            {inv && <p className="text-[10px]" style={{ color: cls.hex }}>{inv.class}</p>}
                          </div>
                        </div>

                        {/* Status badges */}
                        {(isDefeated || isInsane) && (
                          <div className="mb-2 px-2 py-1 rounded text-[10px] font-decorative font-bold text-center"
                            style={{ background: isDefeated ? "rgba(192,57,43,0.15)" : "rgba(124,92,191,0.15)", color: isDefeated ? "#d96b6b" : "#a888e8", border: `1px solid ${isDefeated ? "rgba(192,57,43,0.3)" : "rgba(124,92,191,0.3)"}` }}>
                            <ArkIcon id={isDefeated ? "defeated" : "insane"} size={12} className="inline-block mr-1" />
                            {isDefeated ? "DEFEATED — Take 1 Physical Trauma in campaign" : "INSANE — Take 1 Mental Trauma in campaign"}
                          </div>
                        )}

                        {/* Engaged enemies warning */}
                        {engagedEnemies.length > 0 && (
                          <div className="mb-2 px-2 py-1.5 rounded-lg text-[10px]"
                            style={{ background: "rgba(217,107,107,0.08)", border: "1px solid rgba(217,107,107,0.3)" }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <ArkIcon id="fight" size={11} color="#d96b6b" />
                              <span className="font-decorative font-bold" style={{ color: "#d96b6b" }}>
                                {engagedEnemies.length} enemy engaged — AoO applies!
                              </span>
                            </div>
                            {engagedEnemies.map(e => (
                              <div key={e.id} className="text-[10px] pl-4" style={{ color: "#c08080" }}>
                                {e.name} • Fght {e.fightVal} / Evd {e.evadeVal} / HP {e.currentDamage}/{e.health}
                                {e.keywords.length > 0 && <span style={{ color: "#8a6060" }}> [{e.keywords.join(", ")}]</span>}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Damage */}
                        <div className="mb-2">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                              <ArkIcon id="health" size={11} color="#d96b6b" />
                              <span className="text-[11px]" style={{ color: "#c06060" }}>Damage {player.damage} / {inv?.health ?? 9}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleStatChange(player, "damage", -1)} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold hover:brightness-125" style={{ background: "rgba(192,57,43,0.1)", color: "#d96b6b", border: "1px solid rgba(192,57,43,0.2)" }}>−</button>
                              <button onClick={() => handleStatChange(player, "damage", 1)} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold hover:brightness-125" style={{ background: "rgba(192,57,43,0.1)", color: "#d96b6b", border: "1px solid rgba(192,57,43,0.2)" }}>+</button>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(192,57,43,0.1)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${healthPct}%`, background: healthPct > 75 ? "linear-gradient(90deg, #8e1a0e, #c05050)" : healthPct > 40 ? "linear-gradient(90deg, #8e1a0e, #c07050)" : "linear-gradient(90deg, #8e1a0e, #c08050)" }} />
                          </div>
                        </div>

                        {/* Horror */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                              <ArkIcon id="sanity" size={11} color="#a888e8" />
                              <span className="text-[11px]" style={{ color: "#9070c0" }}>Horror {player.horror} / {inv?.sanity ?? 7}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleStatChange(player, "horror", -1)} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold hover:brightness-125" style={{ background: "rgba(124,92,191,0.1)", color: "#a888e8", border: "1px solid rgba(124,92,191,0.2)" }}>−</button>
                              <button onClick={() => handleStatChange(player, "horror", 1)} className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold hover:brightness-125" style={{ background: "rgba(124,92,191,0.1)", color: "#a888e8", border: "1px solid rgba(124,92,191,0.2)" }}>+</button>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(124,92,191,0.1)" }}>
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${sanityPct}%`, background: "linear-gradient(90deg, #4a3578, #8868c8)" }} />
                          </div>
                        </div>

                        {/* Resources, Clues, XP */}
                        <div className="grid grid-cols-3 gap-2 pt-2.5 mb-3" style={{ borderTop: "1px solid #2e2318" }}>
                          {[
                            { label: "Resources", val: player.resources, color: "#c9973a", field: "resources" as const, iconId: "resource" as const },
                            { label: "Clues", val: extras.clues, color: "#6aabf7", isExtra: true, extraField: "clues" as const, iconId: "clue" as const },
                            { label: "XP", val: extras.xp, color: "#5bbf8a", isExtra: true, extraField: "xp" as const, iconId: "check" as const },
                          ].map(stat => (
                            <div key={stat.label} className="flex flex-col items-center gap-1 py-1.5 rounded" style={{ background: "rgba(10,8,5,0.3)" }}>
                              <div className="flex items-center gap-1">
                                <ArkIcon id={stat.iconId} size={10} color={stat.color} />
                                <span className="text-[9px] font-decorative text-ark-text-muted uppercase tracking-wide">{stat.label}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button onClick={() => stat.isExtra ? updateExtra(player.id, stat.extraField!, -1) : handleStatChange(player, stat.field!, -1)}
                                  className="w-5 h-5 rounded text-xs font-bold" style={{ background: `rgba(${stat.color.slice(1).match(/.{2}/g)?.map(h => parseInt(h, 16)).join(",")},0.1)`, color: stat.color }}>−</button>
                                <span className="font-mono font-bold text-sm w-5 text-center" style={{ color: stat.color }}>{stat.val}</span>
                                <button onClick={() => stat.isExtra ? updateExtra(player.id, stat.extraField!, 1) : handleStatChange(player, stat.field!, 1)}
                                  className="w-5 h-5 rounded text-xs font-bold" style={{ background: `rgba(${stat.color.slice(1).match(/.{2}/g)?.map(h => parseInt(h, 16)).join(",")},0.1)`, color: stat.color }}>+</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Skill stats */}
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

                        {/* Special ability */}
                        {inv && (
                          <div className="mt-2.5 pt-2.5 px-2 py-2 rounded-lg" style={{ borderTop: "1px solid #2e2318", background: `${cls.bg}` }}>
                            <p className="text-[9px] font-decorative uppercase tracking-wider mb-0.5" style={{ color: cls.hex }}>Ability</p>
                            <p className="text-[10px] leading-tight" style={{ color: "#8a7860" }}>{inv.ability}</p>
                          </div>
                        )}

                        {/* Treacheries in threat area */}
                        {treacheries.filter(t => t.playerId === player.id).length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-[10px] font-decorative uppercase tracking-wider" style={{ color: "#d4922a" }}>Threat Area</p>
                            {treacheries.filter(t => t.playerId === player.id).map(t => (
                              <div key={t.id} className="flex items-start justify-between gap-2 px-2 py-1.5 rounded"
                                style={{ background: "rgba(212,146,42,0.07)", border: "1px solid rgba(212,146,42,0.2)" }}>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-semibold font-decorative" style={{ color: "#d4922a" }}>{t.name}</p>
                                  {t.effect && <p className="text-[10px] text-ark-text-muted">{t.effect}</p>}
                                </div>
                                <button onClick={() => setTreacheries(prev => prev.filter(x => x.id !== t.id))}
                                  className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(212,146,42,0.1)", color: "#d4922a", border: "1px solid rgba(212,146,42,0.2)" }}>
                                  Remove
                                </button>
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
        {/* ── ENEMIES TAB ───────────────────────── */}
        {activeTab === "enemies" && (
          <div className="space-y-5">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-decorative font-bold text-base text-ark-text">Enemy Tracker</h2>
                <p className="text-xs text-ark-text-muted">Track all active enemies, their stats, keywords, and engaged investigator</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddTreachery(!showAddTreachery)}
                  className="text-xs font-semibold font-decorative px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(212,146,42,0.08)", border: "1px solid rgba(212,146,42,0.25)", color: "#d4922a" }}>
                  + Add Treachery
                </button>
                <button onClick={() => setShowAddEnemy(!showAddEnemy)}
                  className="text-xs font-semibold font-decorative px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(217,107,107,0.08)", border: "1px solid rgba(217,107,107,0.3)", color: "#d96b6b" }}>
                  + Spawn Enemy
                </button>
              </div>
            </div>

            {/* Add enemy form */}
            {showAddEnemy && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: "rgba(217,107,107,0.05)", border: "1px solid rgba(217,107,107,0.25)" }}>
                <h4 className="font-decorative font-bold text-sm" style={{ color: "#d96b6b" }}>Spawn Enemy</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] font-decorative uppercase tracking-wider text-ark-text-muted block mb-1">Enemy Name</label>
                    <input value={newEnemy.name} onChange={e => setNewEnemy(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Servant of Flame" className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                  </div>
                  {[
                    { label: "Fight", field: "fightVal" as const },
                    { label: "Evade", field: "evadeVal" as const },
                    { label: "Health", field: "health" as const },
                    { label: "Damage", field: "damage" as const },
                    { label: "Horror", field: "horror" as const },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="text-[10px] font-decorative uppercase tracking-wider text-ark-text-muted block mb-1">{f.label}</label>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setNewEnemy(p => ({ ...p, [f.field]: Math.max(0, p[f.field] - 1) }))}
                          className="w-7 h-7 rounded text-sm font-bold" style={{ background: "rgba(217,107,107,0.1)", color: "#d96b6b", border: "1px solid rgba(217,107,107,0.2)" }}>−</button>
                        <span className="font-mono font-bold text-base w-8 text-center text-ark-text">{newEnemy[f.field]}</span>
                        <button onClick={() => setNewEnemy(p => ({ ...p, [f.field]: p[f.field] + 1 }))}
                          className="w-7 h-7 rounded text-sm font-bold" style={{ background: "rgba(217,107,107,0.1)", color: "#d96b6b", border: "1px solid rgba(217,107,107,0.2)" }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-decorative uppercase tracking-wider text-ark-text-muted block mb-1">Keywords</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ENEMY_KEYWORDS.map(k => (
                      <button key={k.key}
                        onClick={() => toggleEnemyKeyword(k.key)}
                        className="px-2 py-1 rounded text-[10px] font-decorative font-semibold transition-all"
                        style={newEnemy.keywords.includes(k.key)
                          ? { background: `${k.color}25`, border: `1px solid ${k.color}60`, color: k.color }
                          : { background: "transparent", border: "1px solid #3d3020", color: "#5a4838" }}>
                        {k.key}
                      </button>
                    ))}
                  </div>
                </div>
                {players.length > 0 && (
                  <div>
                    <label className="text-[10px] font-decorative uppercase tracking-wider text-ark-text-muted block mb-1">Engaged With</label>
                    <select value={newEnemy.engagedPlayerId} onChange={e => setNewEnemy(p => ({ ...p, engagedPlayerId: e.target.value }))}
                      className="ark-input w-full px-3 py-2 rounded-lg text-sm">
                      <option value="">-- Select investigator --</option>
                      {players.map(p => <option key={p.id} value={p.id}>{p.player_name} ({p.investigator})</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setShowAddEnemy(false)} className="btn-ghost flex-1 py-2 text-sm rounded-lg">Cancel</button>
                  <button onClick={handleAddEnemy} disabled={!newEnemy.name.trim()}
                    className="flex-1 py-2 text-sm rounded-lg font-bold transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #a03020, #802010)", color: "#fff", border: "1px solid rgba(217,107,107,0.4)" }}>
                    Spawn Enemy
                  </button>
                </div>
              </div>
            )}

            {/* Add treachery form */}
            {showAddTreachery && (
              <div className="rounded-xl p-4 space-y-3"
                style={{ background: "rgba(212,146,42,0.05)", border: "1px solid rgba(212,146,42,0.25)" }}>
                <h4 className="font-decorative font-bold text-sm" style={{ color: "#d4922a" }}>Add Treachery to Threat Area</h4>
                <input value={newTreachery.name} onChange={e => setNewTreachery(p => ({ ...p, name: e.target.value }))}
                  placeholder="Treachery name (e.g. Paranoia)" className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                <input value={newTreachery.effect} onChange={e => setNewTreachery(p => ({ ...p, effect: e.target.value }))}
                  placeholder="Effect reminder (optional)" className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                {players.length > 0 && (
                  <select value={newTreachery.playerId} onChange={e => setNewTreachery(p => ({ ...p, playerId: e.target.value }))}
                    className="ark-input w-full px-3 py-2 rounded-lg text-sm">
                    <option value="">-- Assign to investigator --</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.player_name}</option>)}
                  </select>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setShowAddTreachery(false)} className="btn-ghost flex-1 py-2 text-sm rounded-lg">Cancel</button>
                  <button onClick={handleAddTreachery} disabled={!newTreachery.name.trim()}
                    className="flex-1 py-2 text-sm rounded-lg font-bold disabled:opacity-40 btn-gold">Add Treachery</button>
                </div>
              </div>
            )}

            {/* Enemy keyword guide */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(217,107,107,0.2)" }}>
              <div className="px-4 py-3" style={{ background: "rgba(217,107,107,0.05)", borderBottom: "1px solid rgba(217,107,107,0.2)" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Enemy Keyword Guide</h3>
                <p className="text-xs text-ark-text-muted">Quick reference — what each keyword means during the Enemy Phase</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-ark-border" style={{ background: "rgba(26,20,16,0.6)" }}>
                {ENEMY_KEYWORDS.map(kw => (
                  <div key={kw.key} className="flex items-start gap-3 px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-decorative font-bold flex-shrink-0 mt-0.5"
                      style={{ background: `${kw.color}18`, border: `1px solid ${kw.color}40`, color: kw.color }}>
                      {kw.key}
                    </span>
                    <p className="text-xs text-ark-text-muted leading-relaxed">{kw.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active enemies */}
            {enemies.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed rgba(217,107,107,0.25)" }}>
                <ArkIcon id="fight" size={36} color="#4a2820" className="mx-auto mb-3" />
                <p className="text-ark-text-muted text-sm">No enemies in play. Use "Spawn Enemy" to add one.</p>
                <p className="text-[11px] text-ark-text-muted mt-1 opacity-60">Enemies spawn engaged unless they have the Aloof keyword.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted">{enemies.length} enem{enemies.length !== 1 ? "ies" : "y"} in play</h3>
                {enemies.map(enemy => {
                  const engagedPlayer = players.find(p => p.id === enemy.engagedPlayerId);
                  const hpPct = Math.min((enemy.currentDamage / enemy.health) * 100, 100);
                  return (
                    <div key={enemy.id} className="rounded-xl p-4"
                      style={{ background: "rgba(26,16,10,0.8)", border: "1px solid rgba(217,107,107,0.25)" }}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="font-decorative font-bold text-sm text-ark-text">{enemy.name}</h4>
                          {enemy.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {enemy.keywords.map(kw => {
                                const kwDef = ENEMY_KEYWORDS.find(k => k.key === kw);
                                return (
                                  <span key={kw} className="text-[9px] font-decorative font-bold px-1.5 py-0.5 rounded"
                                    style={{ background: `${kwDef?.color ?? "#888"}18`, border: `1px solid ${kwDef?.color ?? "#888"}40`, color: kwDef?.color ?? "#888" }}>
                                    {kw}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <button onClick={() => handleDefeatEnemy(enemy.id)}
                          className="text-[10px] font-decorative font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0"
                          style={{ background: "rgba(58,158,107,0.1)", border: "1px solid rgba(58,158,107,0.3)", color: "#5bbf8a" }}>
                          Defeat
                        </button>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
                        {[
                          { label: "Fight", val: enemy.fightVal, color: "#d96b6b", title: "Skill test difficulty to attack" },
                          { label: "Evade", val: enemy.evadeVal, color: "#e8a84a", title: "Skill test difficulty to evade" },
                          { label: "DMG", val: enemy.damage, color: "#d96b6b", title: "Damage dealt per attack" },
                          { label: "HOR", val: enemy.horror, color: "#a888e8", title: "Horror dealt per attack" },
                          { label: "HP", val: `${enemy.currentDamage}/${enemy.health}`, color: "#5bbf8a", title: "Current / max health" },
                        ].map(s => (
                          <div key={s.label} className="text-center py-2 rounded" style={{ background: "rgba(10,8,5,0.4)" }} title={s.title}>
                            <div className="text-[9px] font-decorative text-ark-text-muted tracking-wide">{s.label}</div>
                            <div className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* HP bar */}
                      <div className="mb-3">
                        <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "rgba(58,158,107,0.12)" }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${hpPct}%`, background: hpPct > 66 ? "linear-gradient(90deg, #2a7048, #5bbf8a)" : hpPct > 33 ? "linear-gradient(90deg, #8a6010, #d4922a)" : "linear-gradient(90deg, #8e1a0e, #c05050)" }} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-ark-text-muted">
                            Engaged: <span className="font-semibold" style={{ color: "#e8dcc8" }}>{engagedPlayer?.player_name ?? "unengaged"}</span>
                            {enemy.keywords.includes("Aloof") && <span className="ml-1 text-[9px]" style={{ color: "#a888e8" }}>(Aloof — must use Engage action)</span>}
                            {enemy.keywords.includes("Massive") && <span className="ml-1 text-[9px]" style={{ color: "#e8a84a" }}>(Massive — all investigators!)</span>}
                          </span>
                          <div className="flex gap-1">
                            <button onClick={() => handleEnemyDamage(enemy.id, -1)} className="w-6 h-6 rounded text-xs font-bold" style={{ background: "rgba(58,158,107,0.1)", color: "#5bbf8a", border: "1px solid rgba(58,158,107,0.2)" }}>−</button>
                            <span className="text-[10px] text-ark-text-muted px-1 self-center">dmg</span>
                            <button onClick={() => handleEnemyDamage(enemy.id, 1)} className="w-6 h-6 rounded text-xs font-bold" style={{ background: "rgba(217,107,107,0.1)", color: "#d96b6b", border: "1px solid rgba(217,107,107,0.2)" }}>+</button>
                          </div>
                        </div>
                      </div>

                      {/* Re-engage selector */}
                      {players.length > 0 && (
                        <select value={enemy.engagedPlayerId}
                          onChange={e => setEnemies(prev => prev.map(en => en.id === enemy.id ? { ...en, engagedPlayerId: e.target.value } : en))}
                          className="ark-input w-full px-2 py-1.5 rounded text-xs">
                          <option value="">-- unengaged --</option>
                          {players.map(p => <option key={p.id} value={p.id}>{p.player_name} ({p.investigator})</option>)}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
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
                <p className="text-ark-text-muted text-sm">No actions logged yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {actionLog.map(entry => {
                  const actionDef = ACTIONS.find(a => a.label === entry.action);
                  return (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(26,20,16,0.7)", border: "1px solid #2e2318" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: actionDef ? actionDef.bg : "rgba(61,48,32,0.4)" }}>
                        <ArkIcon id={entry.actionIconId} size={18} color={actionDef?.color ?? "#9a8870"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-decorative font-bold text-sm text-ark-text">{entry.playerName}</span>
                          <span className="text-ark-text-muted text-xs">·</span>
                          <span className="text-xs font-semibold" style={{ color: actionDef?.color ?? "#c9973a" }}>{entry.action}</span>
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

            {/* Round structure */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(168,136,232,0.06)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Round Structure</h3>
                <p className="text-xs text-ark-text-muted">Round 1 skips the Mythos Phase</p>
              </div>
              <div className="divide-y divide-ark-border" style={{ background: "rgba(26,20,16,0.6)" }}>
                {[
                  { phase: "Phase 1: Mythos",        color: "#a888e8", steps: ["Place 1 doom on current agenda", "If doom ≥ threshold → agenda advances", "Each investigator draws 1 encounter card"] },
                  { phase: "Phase 2: Investigation", color: "#6aabf7", steps: ["Each investigator takes 3 actions in player order", "Any action other than Fight/Evade/Parley/Resign while engaged triggers AoO"] },
                  { phase: "Phase 3: Enemy",         color: "#d96b6b", steps: ["Hunter enemies move toward nearest investigator", "Patrol enemies move toward their target", "Each ready engaged enemy attacks — then exhausts"] },
                  { phase: "Phase 4: Upkeep",        color: "#5bbf8a", steps: ["Flip doom/clue tokens face up", "Ready all exhausted cards (unengaged enemies re-engage)", "Each investigator draws 1 card, gains 1 resource", "Discard down to hand limit of 8"] },
                ].map(row => (
                  <div key={row.phase} className="px-4 py-3">
                    <p className="font-decorative font-bold text-xs mb-1.5" style={{ color: row.color }}>{row.phase}</p>
                    <ul className="space-y-0.5">
                      {row.steps.map((s, i) => (
                        <li key={i} className="flex gap-2 items-start text-xs text-ark-text-muted">
                          <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ background: row.color, opacity: 0.6 }} />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill test steps */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(106,171,247,0.06)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Skill Test — 8 Steps</h3>
                <p className="text-xs text-ark-text-muted">Complete ALL steps even on autofail token</p>
              </div>
              <div className="px-4 py-3 space-y-2" style={{ background: "rgba(26,20,16,0.6)" }}>
                {[
                  { n: 1, title: "Determine Skill & Difficulty", desc: "Identify which skill is being tested and the difficulty number to beat" },
                  { n: 2, title: "Commit Cards", desc: "Each player may commit skill cards with matching icons. Max 1 card from another investigator at your location" },
                  { n: 3, title: "Reveal Chaos Token", desc: "Draw 1 token from the chaos bag" },
                  { n: 4, title: "Apply Token Symbol Effects", desc: "Skull/Cultist/Tablet/Elder Thing = check scenario reference card. Elder Sign = investigator's ability" },
                  { n: 5, title: "Calculate Total", desc: "Skill value + committed icons + token modifier = total" },
                  { n: 6, title: "Determine Success/Failure", desc: "If total ≥ difficulty = success. If total < difficulty = failure" },
                  { n: 7, title: "Apply Results", desc: "Resolve 'if successful' and 'if failed' effects on cards and tokens" },
                  { n: 8, title: "Commit Cards Go to Discard", desc: "All committed skill cards are placed in their owners' discard piles" },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 items-start">
                    <div className="step-number flex-shrink-0" style={{ width: 24, height: 24, fontSize: 11, minWidth: 24 }}>{s.n}</div>
                    <div>
                      <p className="text-xs font-semibold font-decorative" style={{ color: "#c9973a" }}>{s.title}</p>
                      <p className="text-ark-text-dim text-xs leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chaos tokens */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(201,151,58,0.06)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Starter Chaos Bag</h3>
                <p className="text-xs text-ark-text-muted">Standard starting bag — 17 tokens</p>
              </div>
              <div className="px-4 py-3" style={{ background: "rgba(26,20,16,0.6)" }}>
                <div className="flex flex-wrap gap-2 mb-4">
                  {CHAOS_TOKENS.map((t, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg min-w-[44px]"
                      style={{ background: "rgba(10,8,5,0.5)", border: `1px solid ${t.color}30` }}>
                      <span className="font-mono font-bold text-sm" style={{ color: t.color }}>{t.token}</span>
                      <span className="text-[8px] font-mono" style={{ color: t.color, opacity: 0.7 }}>{t.mod}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {[
                    { token: "Elder Sign ★", color: "#c9973a", desc: "Bonus modifier PLUS investigator's unique Elder Sign ability triggers" },
                    { token: "Autofail ✕", color: "#c03020", desc: "Automatic failure. Skill value = 0 for 'fail by X' effects. No modifiers apply" },
                    { token: "Skull / Cultist / Tablet / Elder Thing", color: "#8a7060", desc: "Check the scenario reference card for the current scenario's symbol effects" },
                  ].map(t => (
                    <div key={t.token} className="flex gap-2 items-start">
                      <span className="font-mono text-[10px] flex-shrink-0 w-40 font-bold" style={{ color: t.color }}>{t.token}</span>
                      <p className="text-[11px] text-ark-text-muted">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Easily Missed Rules */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,146,42,0.3)" }}>
              <div className="px-4 py-3" style={{ background: "rgba(212,146,42,0.06)", borderBottom: "1px solid rgba(212,146,42,0.25)" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Easily Missed Rules</h3>
                <p className="text-xs text-ark-text-muted">Common mistakes even veterans make — read these!</p>
              </div>
              <div className="divide-y" style={{ background: "rgba(26,20,16,0.6)", borderColor: "rgba(212,146,42,0.1)" }}>
                {MISSED_RULES.map((rule, i) => (
                  <div key={i} className="px-4 py-3">
                    <p className="font-decorative font-bold text-xs mb-1" style={{ color: "#d4922a" }}>{rule.title}</p>
                    <p className="text-xs text-ark-text-muted leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions reference */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(201,151,58,0.06)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">All 10 Investigation Actions</h3>
                <p className="text-xs text-ark-text-muted">Each investigator takes 3 actions per turn</p>
              </div>
              <div className="divide-y divide-ark-border" style={{ background: "rgba(26,20,16,0.6)" }}>
                {ACTIONS.map(action => (
                  <div key={action.id} className="flex items-center gap-3 px-4 py-3">
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

            {/* Investigator quick ref */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(201,151,58,0.04)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Investigator Stats Quick Reference</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ background: "rgba(26,20,16,0.6)" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #2e2318" }}>
                      {["Investigator", "Class", "WIL", "INT", "COM", "AGI", "HP", "SAN", "Elder Sign"].map(h => (
                        <th key={h} className="px-3 py-2 text-left font-decorative text-[10px] uppercase tracking-wider" style={{ color: "#5a4838" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {investigators.map(inv => {
                      const cls = CLASS_COLORS[inv.class];
                      return (
                        <tr key={inv.name} style={{ borderBottom: "1px solid #1e1810" }}>
                          <td className="px-3 py-2 font-decorative font-semibold text-ark-text">{inv.name}</td>
                          <td className="px-3 py-2 font-decorative text-[11px]" style={{ color: cls.hex }}>{inv.class}</td>
                          {[inv.willpower, inv.intellect, inv.combat, inv.agility].map((v, i) => (
                            <td key={i} className="px-3 py-2 font-mono font-bold text-center" style={{ color: ["#a888e8","#6aabf7","#d96b6b","#5bbf8a"][i] }}>{v}</td>
                          ))}
                          <td className="px-3 py-2 font-mono font-bold text-center" style={{ color: "#d96b6b" }}>{inv.health}</td>
                          <td className="px-3 py-2 font-mono font-bold text-center" style={{ color: "#a888e8" }}>{inv.sanity}</td>
                          <td className="px-3 py-2 text-[10px] text-ark-text-muted">{inv.elderSign}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </>
  );
}
