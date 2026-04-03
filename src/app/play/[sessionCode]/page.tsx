"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import {
  getSessionByCode, getPlayers, subscribeToPlayers, subscribeToSession,
  addPlayer, removePlayer, updatePlayerStat, updateTurnState, appendActionLog, updateActionLog,
} from "@/lib/session";
import { GameSession, GamePlayer, TurnState, ActionLogEntry } from "@/types";
import { investigators } from "@/data/investigators";
import { actions as ACTION_DATA } from "@/data/actions";

// ─── Campaigns & Scenarios ────────────────────────────────────────────────────
const CAMPAIGNS = [
  {
    id: "night-of-the-zealot",
    name: "Night of the Zealot",
    subtitle: "Core Set Campaign",
    scenarios: [
      { id: "the-gathering", name: "The Gathering", agendaName: "What's Going On?!", actName: "Trapped", doomThreshold: 3, cluesRequired: 2 },
      { id: "midnight-masks", name: "The Midnight Masks", agendaName: "Predator or Prey?", actName: "Your Soul for His Ascension", doomThreshold: 5, cluesRequired: 3 },
      { id: "devourer-below", name: "The Devourer Below", agendaName: "The Devourer Below", actName: "Into the Darkness", doomThreshold: 5, cluesRequired: 3 },
    ]
  },
  {
    id: "brethren-of-ash",
    name: "Brethren of Ash",
    subtitle: "Standalone Expansion",
    scenarios: [
      { id: "ash-1", name: "Spreading Flames", agendaName: "The Spreading Flames", actName: "Investigating the Cult", doomThreshold: 4, cluesRequired: 2 },
      { id: "ash-2", name: "Smoke and Mirrors", agendaName: "Smoke and Mirrors", actName: "Following the Trail", doomThreshold: 4, cluesRequired: 3 },
      { id: "ash-3", name: "Queen of Ash", agendaName: "The Queen Rises", actName: "Confronting the Brethren", doomThreshold: 5, cluesRequired: 4 },
    ]
  },
  { id: "custom", name: "Custom / Freeform", subtitle: "Enter your own names", scenarios: [] }
];

// ─── Class colours ───────────────────────────────────────────────────────────
const CLASS_COLORS: Record<string, { hex: string; bg: string; border: string; glow: string }> = {
  Guardian: { hex: "#4a8fd4", bg: "rgba(74,143,212,0.12)",  border: "rgba(74,143,212,0.4)",  glow: "rgba(74,143,212,0.2)"  },
  Seeker:   { hex: "#d4922a", bg: "rgba(212,146,42,0.12)",  border: "rgba(212,146,42,0.4)",  glow: "rgba(212,146,42,0.2)"  },
  Rogue:    { hex: "#3a9e6b", bg: "rgba(58,158,107,0.12)",  border: "rgba(58,158,107,0.4)",  glow: "rgba(58,158,107,0.2)"  },
  Mystic:   { hex: "#7c5cbf", bg: "rgba(124,92,191,0.12)",  border: "rgba(124,92,191,0.4)",  glow: "rgba(124,92,191,0.2)"  },
  Survivor: { hex: "#c0392b", bg: "rgba(192,57,43,0.12)",   border: "rgba(192,57,43,0.4)",   glow: "rgba(192,57,43,0.2)"   },
};

// ─── Arkham actions (with rulebook-accurate SVG symbols inline) ───────────────
const ACTIONS = [
  { id: "investigate", label: "Investigate", color: "#6aabf7", bg: "rgba(106,171,247,0.08)", desc: "Test Intellect vs. location shroud to collect a clue", skill: "INT" },
  { id: "move",        label: "Move",        color: "#5bbf8a", bg: "rgba(91,191,138,0.08)",  desc: "Move to a connecting location", skill: null },
  { id: "fight",       label: "Fight",       color: "#d96b6b", bg: "rgba(217,107,107,0.08)", desc: "Test Combat vs. enemy Fight value — deal damage on success", skill: "COM" },
  { id: "evade",       label: "Evade",       color: "#e8a84a", bg: "rgba(232,168,74,0.08)",  desc: "Test Agility vs. enemy Evade value — exhaust the enemy", skill: "AGI" },
  { id: "engage",      label: "Engage",      color: "#d96b6b", bg: "rgba(217,107,107,0.08)", desc: "Engage an unengaged enemy at your location", skill: null },
  { id: "parley",      label: "Parley",      color: "#a888e8", bg: "rgba(168,136,232,0.08)", desc: "Negotiate with an enemy — requires card text to allow it", skill: "WIL" },
  { id: "draw",        label: "Draw",        color: "#a888e8", bg: "rgba(168,136,232,0.08)", desc: "Draw 1 card from your deck", skill: null },
  { id: "resource",    label: "Resource",    color: "#c9973a", bg: "rgba(201,151,58,0.08)",  desc: "Gain 1 resource token from the supply", skill: null },
  { id: "play",        label: "Play Card",   color: "#6aabf7", bg: "rgba(106,171,247,0.08)", desc: "Pay cost and play an Asset or Event from hand", skill: null },
  { id: "activate",    label: "Activate",    color: "#5bbf8a", bg: "rgba(91,191,138,0.08)",  desc: "Use a [→] ability on a card you control", skill: null },
  { id: "resign",      label: "Resign",      color: "#7a7060", bg: "rgba(122,112,96,0.08)",  desc: "Leave the scenario safely at a resign location", skill: null },
] as const;
type ActionId = typeof ACTIONS[number]["id"];

// ─── Phase config ─────────────────────────────────────────────────────────────
const PHASES: { id: TurnState["phase"]; label: string; color: string; desc: string }[] = [
  { id: "mythos",        label: "Mythos",        color: "#a888e8", desc: "Place doom, check threshold, draw encounter cards" },
  { id: "investigation", label: "Investigation",  color: "#6aabf7", desc: "Each investigator takes 3 actions" },
  { id: "enemy",         label: "Enemy",          color: "#d96b6b", desc: "Hunter enemies move, then all engaged enemies attack" },
  { id: "upkeep",        label: "Upkeep",         color: "#5bbf8a", desc: "Ready all exhausted cards, draw 1 card, gain 1 resource" },
];

// ─── Enemy keyword guide ──────────────────────────────────────────────────────
const ENEMY_KEYWORDS = [
  { key: "Hunter",    color: "#d96b6b", desc: "Moves toward nearest investigator each Enemy Phase" },
  { key: "Alert",     color: "#e8a84a", desc: "Attacks if you fail evasion" },
  { key: "Retaliate", color: "#d96b6b", desc: "Attacks if you fail a Fight test against it" },
  { key: "Aloof",     color: "#a888e8", desc: "Won't auto-engage — must use Engage action" },
  { key: "Elusive",   color: "#5bbf8a", desc: "Flees after being attacked" },
  { key: "Massive",   color: "#e8a84a", desc: "Engages ALL investigators at its location" },
  { key: "Patrol",    color: "#6aabf7", desc: "Moves between designated locations each phase" },
  { key: "Doomed",    color: "#c9973a", desc: "When defeated, place 1 doom on current agenda" },
];

interface Enemy {
  id: string; name: string; fightVal: number; evadeVal: number;
  health: number; damage: number; horror: number; currentDamage: number;
  keywords: string[]; engagedPlayerId: string;
}

// ─── SVG Rulebook Symbols ─────────────────────────────────────────────────────
function ActionSymbol({ size = 20 }: { size?: number }) {
  // Arkham Horror action cost symbol: stylised arrow in a circle
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <path d="M8 12h8M13 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function WillpowerIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  // Diamond shape — Willpower
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2L18 10L10 18L2 10Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15"/>
      <path d="M10 5L15 10L10 15L5 10Z" fill={color} fillOpacity="0.5"/>
    </svg>
  );
}

function IntellectIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  // Book / eye — Intellect
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M3 10 Q10 4 17 10 Q10 16 3 10Z" stroke={color} strokeWidth="1.2" fill={color} fillOpacity="0.2"/>
      <circle cx="10" cy="10" r="2.5" fill={color} fillOpacity="0.7"/>
      <circle cx="10" cy="10" r="1" fill={color}/>
    </svg>
  );
}

function CombatIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  // Fist / sword — Combat
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 16L13 4" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M13 4L16 7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M11 6L14 9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="5" cy="15" r="1.5" fill={color} fillOpacity="0.6"/>
    </svg>
  );
}

function AgilityIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  // Running figure / swift lines — Agility
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="13" cy="4" r="2" fill={color} fillOpacity="0.7"/>
      <path d="M7 8l3-3 2 2-4 3v4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 13l-2 4M11 13l1 4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 9h4M3 12h3" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function WildIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  // Star — Wild
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color} fillOpacity="0.8">
      <path d="M10 2l2.1 5.5H18l-4.6 3.4 1.8 5.5L10 13l-5.2 3.4 1.8-5.5L2 7.5h5.9z"/>
    </svg>
  );
}

function DoomIcon({ size = 16, color = "#a888e8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1"/>
      <path d="M10 4v6l4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="10" r="1.5" fill={color}/>
    </svg>
  );
}

function ClueIcon({ size = 16, color = "#6aabf7" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1"/>
      <circle cx="10" cy="10" r="3" fill={color} fillOpacity="0.5"/>
      <circle cx="10" cy="10" r="1.2" fill={color}/>
    </svg>
  );
}

function ResourceIcon({ size = 16, color = "#c9973a" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="3" y="6" width="14" height="10" rx="2" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1"/>
      <path d="M7 6V5a3 3 0 016 0v1" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="11" r="2" fill={color} fillOpacity="0.6"/>
    </svg>
  );
}

function SkillIcon({ skill, size = 14 }: { skill: string; size?: number }) {
  const colorMap: Record<string, string> = { WIL: "#a888e8", INT: "#6aabf7", COM: "#d96b6b", AGI: "#5bbf8a", WILD: "#c9973a" };
  const color = colorMap[skill] ?? "#888";
  if (skill === "WIL") return <WillpowerIcon size={size} color={color} />;
  if (skill === "INT") return <IntellectIcon size={size} color={color} />;
  if (skill === "COM") return <CombatIcon size={size} color={color} />;
  if (skill === "AGI") return <AgilityIcon size={size} color={color} />;
  return <WildIcon size={size} color={color} />;
}

// ─── Easily missed rules for reference tab ───────────────────────────────────
const MISSED_RULES = [
  { title: "Attacks of Opportunity", desc: "If engaged with a ready enemy, any action other than Fight, Evade, Parley, or Resign triggers an immediate free attack from every engaged enemy." },
  { title: "Enemy Doesn't Exhaust from AoO", desc: "An Attack of Opportunity does NOT exhaust the enemy. It can still attack again during the Enemy Phase." },
  { title: "Evading Exhausts the Enemy", desc: "A successful Evade exhausts the enemy — it won't attack during Enemy Phase this round. But it readies again during Upkeep." },
  { title: "Non-Hunter Enemies Don't Move", desc: "Only Hunter enemies move during the Enemy Phase. Other enemies stay put unless a card says otherwise." },
  { title: "Aloof Enemies Don't Auto-Engage", desc: "Aloof enemies must be engaged with the Engage action. They won't attack or trigger AoO until engaged." },
  { title: "Help Another Investigator", desc: "You can commit 1 card to another investigator's skill test, but only if you're at the same location." },
  { title: "Cannot is Absolute", desc: "Any effect with the word 'cannot' overrides everything. Nothing can override a 'cannot' effect." },
  { title: "Autofail Token", desc: "The tentacle token is an automatic failure. No modifiers apply. Treat skill value as 0 for 'fail by X' effects." },
  { title: "Round 1 Skips Mythos", desc: "The very first round of every scenario skips the Mythos Phase entirely. Start directly at Investigation." },
  { title: "Fast Cards Cost No Action", desc: "Fast cards don't cost an action to play. They still cost resources. Can be played anytime — even between phases." },
];

const CHAOS_TOKENS = [
  { token: "+1", color: "#5bbf8a" }, { token: "0", color: "#8a8070" }, { token: "0", color: "#8a8070" },
  { token: "−1", color: "#e8a84a" }, { token: "−1", color: "#e8a84a" }, { token: "−1", color: "#e8a84a" }, { token: "−1", color: "#e8a84a" },
  { token: "−2", color: "#d98a40" }, { token: "−2", color: "#d98a40" },
  { token: "−3", color: "#d96b6b" }, { token: "−4", color: "#c05050" },
  { token: "Skull", color: "#8a7060" }, { token: "Cultist", color: "#8a7060" },
  { token: "Tablet", color: "#8a7060" }, { token: "Elder Thing", color: "#8a7060" },
  { token: "Elder Sign", color: "#c9973a" }, { token: "Auto-fail", color: "#c03020" },
];

// ─── Default turn state ───────────────────────────────────────────────────────
const DEFAULT_TURN_STATE: TurnState = {
  currentPlayerIdx: 0, actionsUsed: 0, round: 1, phase: "investigation",
  leadInvestigatorIdx: 0, doom: 0, doomThreshold: 3,
  agendaName: "Past Curfew", actName: "Where There Is Smoke…", cluesRequired: 2,
  gameStarted: false,
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SessionPage() {
  const params = useParams();
  const sessionCode = (params.sessionCode as string)?.toUpperCase();

  const [session, setSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Who am I? — each player sets their name once to identify themselves
  const [myPlayerName, setMyPlayerName] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("ark_player_name") ?? "";
    return "";
  });
  const [nameInput, setNameInput] = useState("");
  const [showNamePicker, setShowNamePicker] = useState(false);

  // Add player form
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [addingName, setAddingName] = useState("");
  const [addingInvestigator, setAddingInvestigator] = useState(investigators[0].name);
  const [addingPlayer, setAddingPlayer] = useState(false);

  // Turn state — synced from Supabase
  const [turnState, setTurnState] = useState<TurnState>(DEFAULT_TURN_STATE);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const turnStateRef = useRef(turnState);
  turnStateRef.current = turnState;

  // Action selection
  const [selectedAction, setSelectedAction] = useState<typeof ACTIONS[number] | null>(null);
  const [actionDetail, setActionDetail] = useState("");

  // Tabs
  const [activeTab, setActiveTab] = useState<"board" | "enemies" | "log" | "reference">("board");

  // Enemies (local for now — can extend to Supabase later)
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [showAddEnemy, setShowAddEnemy] = useState(false);
  const [newEnemy, setNewEnemy] = useState({ name: "", fightVal: 3, evadeVal: 3, health: 3, damage: 1, horror: 1, keywords: [] as string[], engagedPlayerId: "" });

  // Phase transition animation
  const [phaseFlash, setPhaseFlash] = useState(false);

  // Player reorder mode
  const [reorderMode, setReorderMode] = useState(false);

  // View board while it's your turn
  const [viewBoardMode, setViewBoardMode] = useState(false);

  // Campaign picker modal
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Round editing
  const [showRoundEdit, setShowRoundEdit] = useState(false);
  const [roundEditValue, setRoundEditValue] = useState<string>("");

  // Join screen for latecomers
  const [joiningName, setJoiningName] = useState("");
  const [joiningInvestigator, setJoiningInvestigator] = useState(investigators[0].name);
  const [joiningPlayer, setJoiningPlayer] = useState(false);

  // Lobby setup: lead + turn order must be confirmed before Start Game
  const [lobbyLeadIdx, setLobbyLeadIdx] = useState(0);
  const [lobbyOrderConfirmed, setLobbyOrderConfirmed] = useState(false);
  const [lobbyLeadConfirmed, setLobbyLeadConfirmed] = useState(false);

  // Inline learn modal
  const [learnModalActionId, setLearnModalActionId] = useState<string | null>(null);

  // ── Data loading ──────────────────────────────────────────
  const loadSession = useCallback(async () => {
    if (!sessionCode) return;
    const s = await getSessionByCode(sessionCode);
    if (!s) { setError(`Session "${sessionCode}" not found.`); setLoading(false); return; }
    setSession(s);
    if (s.turn_state) setTurnState(s.turn_state);
    if (s.action_log) setActionLog(s.action_log);
    const p = await getPlayers(s.id);
    setPlayers(p);
    setLoading(false);
    // Save session code to localStorage for recovery
    if (typeof window !== "undefined") {
      localStorage.setItem("ark_last_session", sessionCode);
    }
  }, [sessionCode]);

  useEffect(() => { loadSession(); }, [loadSession]);

  useEffect(() => {
    if (!session) return;
    const unsubPlayers = subscribeToPlayers(session.id, setPlayers);
    const unsubSession = subscribeToSession(session.id, (updated) => {
      if (updated.turn_state) {
        setTurnState(updated.turn_state);
      }
      if (updated.action_log) {
        setActionLog(updated.action_log);
      }
    });
    return () => { unsubPlayers(); unsubSession(); };
  }, [session]);

  // Identity onboarding
  useEffect(() => {
    if (!loading && players.length > 0 && !myPlayerName) {
      setShowNamePicker(true);
    }
  }, [loading, players.length, myPlayerName]);

  // ── Derived values ────────────────────────────────────────
  const currentPlayer = players[turnState.currentPlayerIdx] ?? null;
  const leadPlayer = players[turnState.leadInvestigatorIdx] ?? null;
  const myPlayer = players.find(p => p.player_name === myPlayerName) ?? null;
  const isMyTurn = myPlayer && currentPlayer && myPlayer.id === currentPlayer.id;
  const isLead = myPlayer && leadPlayer && myPlayer.id === leadPlayer.id;
  const doomPct = Math.min((turnState.doom / Math.max(1, turnState.doomThreshold)) * 100, 100);
  const doomDanger = turnState.doom >= turnState.doomThreshold;
  const currentPhase = PHASES.find(p => p.id === turnState.phase)!;

  // Ordered players for turn order
  const orderedPlayers = turnState.playerOrder ? [...players].sort((a,b) => (turnState.playerOrder!.indexOf(a.id) - turnState.playerOrder!.indexOf(b.id))) : players;

  // ── Turn management ───────────────────────────────────────
  const pushTurnState = useCallback(async (next: TurnState) => {
    setTurnState(next);
    if (session) await updateTurnState(session.id, next);
  }, [session]);

  const pushLog = useCallback(async (entry: ActionLogEntry) => {
    setActionLog(prev => [entry, ...prev].slice(0, 100));
    if (session) await appendActionLog(session.id, actionLog, entry);
  }, [session, actionLog]);

  const handleLogAction = async () => {
    if (!currentPlayer || !selectedAction || !session) return;
    const ts = turnStateRef.current;
    const newActionsUsed = ts.actionsUsed + 1;

    const entry: ActionLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      playerName: currentPlayer.player_name,
      investigator: currentPlayer.investigator,
      action: selectedAction.label,
      detail: actionDetail || selectedAction.desc,
      timestamp: new Date().toISOString(),
      round: ts.round,
      actionNum: newActionsUsed,
      phase: ts.phase,
    };
    await pushLog(entry);

    const next = { ...ts, actionsUsed: newActionsUsed };
    await pushTurnState(next);
    setSelectedAction(null);
    setActionDetail("");
  };

  const handleEndTurn = async () => {
    if (!currentPlayer || !session) return;
    const ts = turnStateRef.current;
    const entry: ActionLogEntry = {
      id: `end-${Date.now()}`,
      playerName: currentPlayer.player_name,
      investigator: currentPlayer.investigator,
      action: "End Turn",
      detail: `Ended turn with ${3 - ts.actionsUsed} action(s) remaining`,
      timestamp: new Date().toISOString(),
      round: ts.round,
      actionNum: ts.actionsUsed,
      phase: ts.phase,
    };
    await pushLog(entry);

    const nextIdx = (ts.currentPlayerIdx + 1) % Math.max(1, players.length);
    const allDone = nextIdx === 0 || nextIdx <= ts.leadInvestigatorIdx && ts.currentPlayerIdx >= players.length - 1;
    // When all investigators have gone, move to Enemy Phase
    const isLastPlayer = (ts.currentPlayerIdx === players.length - 1);
    let nextPhase = ts.phase;
    let nextRound = ts.round;

    if (ts.phase === "investigation" && isLastPlayer) {
      nextPhase = "enemy";
    } else if (ts.phase === "enemy" && isLastPlayer) {
      nextPhase = "upkeep";
    } else if (ts.phase === "upkeep" && isLastPlayer) {
      nextPhase = "mythos";
      nextRound = ts.round + 1;
    } else if (ts.phase === "mythos" && isLastPlayer) {
      nextPhase = "investigation";
    }

    const next: TurnState = {
      ...ts,
      currentPlayerIdx: isLastPlayer ? 0 : nextIdx,
      actionsUsed: 0,
      round: nextRound,
      phase: nextPhase,
    };
    setPhaseFlash(true);
    setViewBoardMode(false);
    setTimeout(() => setPhaseFlash(false), 1200);
    await pushTurnState(next);
  };

  // Lead advances mythos/enemy/upkeep for the whole group
  const handleLeadPhaseAction = async (label: string, detail: string) => {
    if (!leadPlayer || !session) return;
    const ts = turnStateRef.current;
    const entry: ActionLogEntry = {
      id: `lead-${Date.now()}`,
      playerName: leadPlayer.player_name,
      investigator: leadPlayer.investigator,
      action: label,
      detail,
      timestamp: new Date().toISOString(),
      round: ts.round,
      actionNum: 0,
      phase: ts.phase,
    };
    await pushLog(entry);
  };

  const handleAdvancePhase = async () => {
    const ts = turnStateRef.current;
    const phaseOrder: TurnState["phase"][] = ["mythos", "investigation", "enemy", "upkeep"];
    const idx = phaseOrder.indexOf(ts.phase);
    const nextPhase = phaseOrder[(idx + 1) % 4];
    const nextRound = nextPhase === "mythos" ? ts.round + 1 : ts.round;
    const next: TurnState = { ...ts, phase: nextPhase, currentPlayerIdx: 0, actionsUsed: 0, round: nextRound };
    setPhaseFlash(true);
    setTimeout(() => setPhaseFlash(false), 1200);
    await pushTurnState(next);
    await handleLeadPhaseAction("Phase Advance", `Moved to ${nextPhase.toUpperCase()} Phase — Round ${nextRound}`);
  };

  const handleAdvanceAct = async () => {
    const ts = turnStateRef.current;
    const nextScenarioNumber = (ts.scenarioNumber ?? 1) + 1;
    const next = { ...ts, scenarioNumber: nextScenarioNumber };
    await pushTurnState(next);
    await handleLeadPhaseAction("Act Advanced", `Advanced to Act ${nextScenarioNumber}`);
  };

  const handleAdvanceScenario = async () => {
    const ts = turnStateRef.current;
    if (!ts.campaignId) return;
    const campaign = CAMPAIGNS.find(c => c.id === ts.campaignId);
    if (!campaign) return;
    const currentIdx = campaign.scenarios.findIndex(s => s.id === ts.scenarioId);
    const nextScenario = campaign.scenarios[currentIdx + 1];
    if (!nextScenario) {
      // Campaign complete
      await pushTurnState({ ...ts, scenarioComplete: true });
      await handleLeadPhaseAction("Campaign Complete", `Completed all scenarios in ${campaign.name}`);
      return;
    }
    const next: TurnState = {
      ...ts,
      scenarioId: nextScenario.id,
      agendaName: nextScenario.agendaName,
      actName: nextScenario.actName,
      doomThreshold: nextScenario.doomThreshold,
      cluesRequired: nextScenario.cluesRequired,
      doom: 0,
      scenarioNumber: 1,
      round: 1,
      phase: "investigation",
      currentPlayerIdx: 0,
      actionsUsed: 0,
    };
    await pushTurnState(next);
    await handleLeadPhaseAction("Scenario Advanced", `Now playing: ${nextScenario.name}`);
  };

  const handleUndoLastAction = async () => {
    if (!session || actionLog.length === 0) return;
    // Remove most recent non-system action
    const lastRealIdx = actionLog.findIndex(e => e.action !== "Undo" && e.action !== "Log Cleared");
    const idxToRemove = lastRealIdx >= 0 ? lastRealIdx : 0;
    const removedEntry = actionLog[idxToRemove];
    const newLog = actionLog.filter((_, i) => i !== idxToRemove);
    setActionLog(newLog);
    // Undo actionsUsed if it was the active player's regular action
    const ts = turnStateRef.current;
    if (removedEntry.playerName === currentPlayer?.player_name && removedEntry.action !== "End Turn" && ts.actionsUsed > 0) {
      await pushTurnState({ ...ts, actionsUsed: Math.max(0, ts.actionsUsed - 1) });
    }
    if (session) await updateActionLog(session.id, newLog);
  };

  const handleDeleteLogEntry = async (entryId: string) => {
    const newLog = actionLog.filter(e => e.id !== entryId);
    setActionLog(newLog);
    if (session) await updateActionLog(session.id, newLog);
  };

  const handleFixRound = async (newRound: number) => {
    if (newRound < 1) return;
    const ts = turnStateRef.current;
    await pushTurnState({ ...ts, round: newRound });
    await handleLeadPhaseAction("Round Corrected", `Round manually set to ${newRound}`);
    setShowRoundEdit(false);
  };

  const handleSelectScenario = async (campaignId: string, scenarioId: string) => {
    const campaign = CAMPAIGNS.find(c => c.id === campaignId);
    const scenario = campaign?.scenarios.find(s => s.id === scenarioId);
    if (!scenario) return;

    const next = {
      ...turnState,
      agendaName: scenario.agendaName,
      actName: scenario.actName,
      doomThreshold: scenario.doomThreshold,
      cluesRequired: scenario.cluesRequired,
      scenarioNumber: 1,
      campaignId,
      scenarioId,
    };
    await pushTurnState(next);
    setShowCampaignPicker(false);
    setSelectedCampaignId(null);
  };

  const handleStartGame = async () => {
    if (!session || players.length === 0) return;
    const orderedIds = turnState.playerOrder ?? players.map(p => p.id);
    const next: TurnState = {
      ...turnState,
      gameStarted: true,
      currentPlayerIdx: 0,
      actionsUsed: 0,
      playerOrder: orderedIds,
      leadInvestigatorIdx: lobbyLeadIdx,
    };
    await pushTurnState(next);
  };

  // ── Player management ─────────────────────────────────────
  const handleAddPlayer = async () => {
    if (!session || !addingName.trim()) return;
    setAddingPlayer(true);
    await addPlayer(session.id, addingName.trim(), addingInvestigator);
    setAddingName("");
    setShowAddPlayer(false);
    setAddingPlayer(false);
  };

  const handleRemove = async (player: GamePlayer) => {
    if (!confirm(`Remove ${player.player_name} from this session?`)) return;
    await removePlayer(player.id);
    const ts = turnStateRef.current;
    const newLen = players.length - 1;
    if (newLen > 0 && ts.currentPlayerIdx >= newLen) {
      await pushTurnState({ ...ts, currentPlayerIdx: 0, actionsUsed: 0 });
    }
  };

  const handleStatChange = async (player: GamePlayer, field: "damage" | "horror" | "resources" | "clues" | "xp", delta: number) => {
    await updatePlayerStat(player.id, field, Math.max(0, player[field] + delta));
  };

  const handleReorderPlayer = async (playerId: string, direction: "up" | "down") => {
    const currentOrder = turnState.playerOrder ? [...turnState.playerOrder] : players.map(p => p.id);
    const idx = currentOrder.indexOf(playerId);
    if (idx === -1) return;

    if (direction === "up" && idx > 0) {
      [currentOrder[idx], currentOrder[idx - 1]] = [currentOrder[idx - 1], currentOrder[idx]];
    } else if (direction === "down" && idx < currentOrder.length - 1) {
      [currentOrder[idx], currentOrder[idx + 1]] = [currentOrder[idx + 1], currentOrder[idx]];
    }

    await pushTurnState({ ...turnState, playerOrder: currentOrder });
  };

  // ── Enemy helpers ─────────────────────────────────────────
  const handleAddEnemy = () => {
    if (!newEnemy.name.trim()) return;
    setEnemies(prev => [...prev, { id: `e-${Date.now()}`, ...newEnemy, currentDamage: 0, engagedPlayerId: newEnemy.engagedPlayerId || (players[0]?.id ?? "") }]);
    setNewEnemy({ name: "", fightVal: 3, evadeVal: 3, health: 3, damage: 1, horror: 1, keywords: [], engagedPlayerId: "" });
    setShowAddEnemy(false);
  };

  const handleEnemyDamage = (id: string, delta: number) => {
    setEnemies(prev => prev.map(e => e.id !== id ? e : { ...e, currentDamage: Math.max(0, e.currentDamage + delta) }));
  };
  const handleDefeatEnemy = (id: string) => {
    const e = enemies.find(x => x.id === id);
    if (e?.keywords.includes("Doomed")) pushTurnState({ ...turnStateRef.current, doom: turnStateRef.current.doom + 1 });
    setEnemies(prev => prev.filter(x => x.id !== id));
  };
  const toggleEnemyKeyword = (k: string) => setNewEnemy(prev => ({
    ...prev, keywords: prev.keywords.includes(k) ? prev.keywords.filter(x => x !== k) : [...prev.keywords, k],
  }));

  // ── Name identification ───────────────────────────────────
  const handleSetName = (name: string) => {
    setMyPlayerName(name);
    localStorage.setItem("ark_player_name", name);
    setShowNamePicker(false);
  };

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading / error states ────────────────────────────────
  if (loading) return (
    <><Navbar /><main className="max-w-5xl mx-auto px-4 py-20 text-center">
      <div className="space-y-3 animate-pulse">
        <div className="h-6 w-40 rounded mx-auto" style={{ background: "#1a1410" }} />
        <div className="h-4 w-60 rounded mx-auto" style={{ background: "#1a1410" }} />
      </div>
    </main></>
  );

  if (error) return (
    <><Navbar /><main className="max-w-5xl mx-auto px-4 py-12">
      <BackButton href="/play" label="Back to Play" />
      <div className="rounded-xl p-6 text-center" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)" }}>
        <p className="font-decorative font-bold text-lg mb-2" style={{ color: "#e07060" }}>Session Not Found</p>
        <p className="text-ark-text-muted text-sm">{error}</p>
      </div>
    </main></>
  );

  // ══════════════════════════════════════════════════════════
  // ── LOBBY — shown before the game is started
  // ══════════════════════════════════════════════════════════
  if (!turnState.gameStarted) {
    const orderedLobbyPlayers = turnState.playerOrder
      ? [...players].sort((a, b) => (turnState.playerOrder!.indexOf(a.id) - turnState.playerOrder!.indexOf(b.id)))
      : players;

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0c0f14" }}>
        <Navbar />
        <main className="max-w-lg mx-auto px-4 py-10 w-full">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest mb-4 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(201,151,58,0.08)", border: "1px solid rgba(201,151,58,0.25)", color: "#c9973a" }}>
              <span className="live-dot" /> LOBBY · {sessionCode}
            </div>
            <h1 className="font-decorative font-bold text-2xl text-ark-text mb-2">Game Setup</h1>
            <p className="text-ark-text-muted text-sm">Add all investigators, set your turn order, then start the game.</p>
            <p className="text-xs mt-2 font-mono" style={{ color: "#5a4838" }}>Share this session code with other players: <span style={{ color: "#c9973a" }}>{sessionCode}</span></p>
          </div>

          {/* Share */}
          <button onClick={handleCopyLink}
            className="w-full py-2.5 rounded-xl text-xs font-semibold font-mono mb-6 transition-all"
            style={{ background: "rgba(201,151,58,0.08)", border: "1px solid rgba(201,151,58,0.25)", color: copied ? "#5bbf8a" : "#c9973a" }}>
            {copied ? "✓ Link copied!" : "📋 Copy invite link"}
          </button>

          {/* ── STEP 1: Investigators ── */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                style={{ background: "rgba(201,151,58,0.2)", border: "1px solid rgba(201,151,58,0.5)", color: "#c9973a" }}>1</div>
              <h2 className="text-sm font-decorative font-bold text-ark-text">Add Investigators</h2>
              <span className="text-xs text-ark-text-muted font-mono">({players.length} / 4)</span>
            </div>

            {players.length === 0 ? (
              <div className="rounded-xl p-6 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed #3d3020" }}>
                <p className="text-ark-text-muted text-sm">No investigators yet. Add the first one below.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderedLobbyPlayers.map((player, idx) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <div key={player.id} className="flex items-center gap-3 rounded-xl p-3 transition-all"
                      style={{ background: "linear-gradient(135deg, #1a1410, #120e09)", border: `1px solid ${cls.border}` }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                        style={{ background: "rgba(201,151,58,0.12)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}>
                        {idx + 1}
                      </div>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex }}>
                        {player.investigator[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-decorative font-bold text-sm text-ark-text truncate">{player.player_name}</p>
                        <p className="text-xs" style={{ color: cls.hex }}>{player.investigator} · {inv?.class}</p>
                      </div>
                      <button onClick={() => handleRemove(player)}
                        className="w-7 h-7 rounded-full text-xs flex items-center justify-center transition-all"
                        style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#d96b6b" }}>
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── STEP 2: Turn Order ── */}
          {players.length >= 2 && (
            <div className="mb-5 rounded-xl p-4" style={{ background: lobbyOrderConfirmed ? "rgba(91,191,138,0.06)" : "rgba(26,20,16,0.7)", border: `1px solid ${lobbyOrderConfirmed ? "rgba(91,191,138,0.4)" : "#3d3020"}` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                  style={{ background: lobbyOrderConfirmed ? "rgba(91,191,138,0.3)" : "rgba(201,151,58,0.2)", border: `1px solid ${lobbyOrderConfirmed ? "rgba(91,191,138,0.6)" : "rgba(201,151,58,0.5)"}`, color: lobbyOrderConfirmed ? "#5bbf8a" : "#c9973a" }}>
                  {lobbyOrderConfirmed ? "✓" : "2"}
                </div>
                <h2 className="text-sm font-decorative font-bold text-ark-text">Set Turn Order</h2>
                {lobbyOrderConfirmed && <span className="text-xs font-mono" style={{ color: "#5bbf8a" }}>Confirmed</span>}
              </div>
              <div className="space-y-2 mb-3">
                {orderedLobbyPlayers.map((player, idx) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <div key={player.id} className="flex items-center gap-3 rounded-lg p-2.5"
                      style={{ background: "rgba(10,8,5,0.4)", border: `1px solid ${cls.border}50` }}>
                      <span className="font-mono font-bold text-sm w-5 text-center flex-shrink-0" style={{ color: "#c9973a" }}>{idx + 1}</span>
                      <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ background: cls.bg, color: cls.hex }}>{player.investigator[0]}</div>
                      <span className="flex-1 text-sm font-decorative text-ark-text truncate">{player.player_name}</span>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => handleReorderPlayer(player.id, "up")}
                          disabled={orderedLobbyPlayers[0]?.id === player.id}
                          className="w-5 h-5 rounded text-[10px] flex items-center justify-center disabled:opacity-20"
                          style={{ background: "rgba(91,191,138,0.2)", color: "#5bbf8a" }}>↑</button>
                        <button onClick={() => handleReorderPlayer(player.id, "down")}
                          disabled={orderedLobbyPlayers[orderedLobbyPlayers.length - 1]?.id === player.id}
                          className="w-5 h-5 rounded text-[10px] flex items-center justify-center disabled:opacity-20"
                          style={{ background: "rgba(91,191,138,0.2)", color: "#5bbf8a" }}>↓</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setLobbyOrderConfirmed(true)}
                className="w-full py-2 rounded-lg text-sm font-bold font-decorative transition-all"
                style={{ background: lobbyOrderConfirmed ? "rgba(91,191,138,0.15)" : "rgba(91,191,138,0.2)", border: `1px solid rgba(91,191,138,0.5)`, color: "#5bbf8a" }}>
                {lobbyOrderConfirmed ? "✓ Turn Order Confirmed" : "Confirm Turn Order →"}
              </button>
            </div>
          )}

          {/* ── STEP 3: Lead Investigator ── */}
          {players.length >= 1 && (
            <div className="mb-5 rounded-xl p-4" style={{ background: lobbyLeadConfirmed ? "rgba(201,151,58,0.06)" : "rgba(26,20,16,0.7)", border: `1px solid ${lobbyLeadConfirmed ? "rgba(201,151,58,0.4)" : "#3d3020"}` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                  style={{ background: lobbyLeadConfirmed ? "rgba(201,151,58,0.3)" : "rgba(201,151,58,0.15)", border: "1px solid rgba(201,151,58,0.5)", color: "#c9973a" }}>
                  {lobbyLeadConfirmed ? "✓" : players.length >= 2 ? "3" : "2"}
                </div>
                <h2 className="text-sm font-decorative font-bold text-ark-text">Choose Lead Investigator</h2>
                {lobbyLeadConfirmed && <span className="text-xs font-mono" style={{ color: "#c9973a" }}>Confirmed</span>}
              </div>
              <p className="text-[10px] text-ark-text-muted mb-3 leading-relaxed">The Lead Investigator manages Mythos, Enemy, and Upkeep phases for the group.</p>
              <div className="space-y-1.5 mb-3">
                {orderedLobbyPlayers.map((player, idx) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  const isSelected = lobbyLeadIdx === idx;
                  return (
                    <button key={player.id} onClick={() => { setLobbyLeadIdx(idx); setLobbyLeadConfirmed(false); }}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left"
                      style={{ background: isSelected ? cls.bg : "rgba(10,8,5,0.4)", border: `1px solid ${isSelected ? cls.border : "#3d3020"}` }}>
                      <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ background: cls.bg, color: cls.hex }}>{player.investigator[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-decorative font-bold text-ark-text truncate">{player.player_name}</p>
                        <p className="text-[10px]" style={{ color: cls.hex }}>{player.investigator}</p>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: "rgba(201,151,58,0.2)", color: "#c9973a" }}>★ LEAD</span>
                      )}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setLobbyLeadConfirmed(true)}
                className="w-full py-2 rounded-lg text-sm font-bold font-decorative transition-all"
                style={{ background: lobbyLeadConfirmed ? "rgba(201,151,58,0.15)" : "rgba(201,151,58,0.2)", border: "1px solid rgba(201,151,58,0.5)", color: "#c9973a" }}>
                {lobbyLeadConfirmed ? "✓ Lead Confirmed" : "Confirm Lead Investigator →"}
              </button>
            </div>
          )}

          {/* Add player form */}
          {players.length < 4 && (
            <div className="rounded-xl p-4 mb-6 space-y-3" style={{ background: "rgba(26,20,16,0.8)", border: "1px solid rgba(201,151,58,0.2)" }}>
              <h3 className="font-decorative font-semibold text-sm text-ark-text">
                {players.length === 0 ? "Add First Investigator" : "Add Another Investigator"}
              </h3>
              <input value={addingName} onChange={e => setAddingName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddPlayer()}
                placeholder="Player name"
                className="ark-input w-full px-3 py-2.5 rounded-lg text-sm" />
              <select value={addingInvestigator} onChange={e => setAddingInvestigator(e.target.value)} className="ark-input w-full px-3 py-2.5 rounded-lg text-sm">
                {investigators.map(inv => <option key={inv.name} value={inv.name}>{inv.name} ({inv.class})</option>)}
              </select>
              {/* Investigator stat preview */}
              {(() => {
                const selInv = investigators.find(i => i.name === addingInvestigator);
                if (!selInv) return null;
                const cls = CLASS_COLORS[selInv.class ?? "Guardian"];
                return (
                  <div className="rounded-lg p-2.5 grid grid-cols-6 gap-1.5 text-center" style={{ background: cls.bg, border: `1px solid ${cls.border}` }}>
                    {[
                      { label: "HP", val: selInv.health, color: "#d96b6b" },
                      { label: "SAN", val: selInv.sanity, color: "#a888e8" },
                      { label: "WIL", val: selInv.willpower, color: "#a888e8" },
                      { label: "INT", val: selInv.intellect, color: "#6aabf7" },
                      { label: "COM", val: selInv.combat, color: "#d96b6b" },
                      { label: "AGI", val: selInv.agility, color: "#5bbf8a" },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="text-[9px] font-mono text-ark-text-muted">{s.label}</div>
                        <div className="font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <button onClick={handleAddPlayer} disabled={addingPlayer || !addingName.trim()} className="btn-gold w-full py-2.5 text-sm rounded-lg disabled:opacity-40">
                {addingPlayer ? "Adding…" : "+ Add to Lobby"}
              </button>
            </div>
          )}

          {players.length >= 4 && (
            <div className="rounded-xl p-3 mb-6 text-center text-xs font-mono" style={{ background: "rgba(201,151,58,0.06)", border: "1px solid rgba(201,151,58,0.2)", color: "#c9973a" }}>
              Maximum 4 investigators reached
            </div>
          )}

          {/* ── STEP FINAL: Start Game ── */}
          {(() => {
            const needsOrderConfirm = players.length >= 2 && !lobbyOrderConfirmed;
            const needsLeadConfirm = !lobbyLeadConfirmed;
            const ready = players.length > 0 && !needsOrderConfirm && !needsLeadConfirm;
            const blockReason = players.length === 0 ? "Add investigators first"
              : needsOrderConfirm && needsLeadConfirm ? "Confirm turn order and lead investigator above"
              : needsOrderConfirm ? "Confirm turn order above"
              : needsLeadConfirm ? "Confirm lead investigator above"
              : null;
            return (
              <>
                <button onClick={handleStartGame} disabled={!ready}
                  className="w-full py-4 rounded-2xl font-decorative font-bold text-base tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: ready ? "linear-gradient(135deg, #c9973a, #a07828)" : "rgba(26,20,16,0.8)",
                    color: ready ? "#0a0805" : "#5a4838",
                    border: "1px solid rgba(201,151,58,0.4)",
                    boxShadow: ready ? "0 0 32px rgba(201,151,58,0.25)" : "none"
                  }}>
                  {ready ? `▶ Start Game — ${players.length} Investigator${players.length !== 1 ? "s" : ""}` : "Start Game"}
                </button>
                {blockReason && (
                  <p className="text-center text-xs mt-2 font-mono" style={{ color: "#d96b6b" }}>⚠ {blockReason}</p>
                )}
                {ready && <p className="text-center text-xs text-ark-text-muted mt-2">Round 1 skips the Mythos Phase — first investigator goes immediately.</p>}
              </>
            );
          })()}

        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // ── JOIN / IDENTIFY SCREEN — game started, device not identified
  // ══════════════════════════════════════════════════════════
  if (turnState.gameStarted && !myPlayer) {
    const usedInvestigators = players.map(p => p.investigator);
    const availableInvestigators = investigators.filter(i => !usedInvestigators.includes(i.name));
    const canAddNew = players.length < 4;

    const handleJoinGame = async () => {
      if (!session || !joiningName.trim()) return;
      setJoiningPlayer(true);
      const newP = await addPlayer(session.id, joiningName.trim(), joiningInvestigator);
      if (newP) handleSetName(joiningName.trim());
      setJoiningPlayer(false);
    };

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0c0f14" }}>
        <Navbar />
        <main className="max-w-sm mx-auto px-4 py-10 w-full">
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest mb-4 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(91,191,138,0.08)", border: "1px solid rgba(91,191,138,0.25)", color: "#5bbf8a" }}>
              <span className="live-dot" /> GAME IN PROGRESS · {sessionCode}
            </div>
            <h1 className="font-decorative font-bold text-2xl text-ark-text mb-1">Who are you?</h1>
            <p className="text-ark-text-muted text-sm">Select your investigator or join as a new player.</p>
          </div>

          {/* PATH A — That's me (pick existing) */}
          {players.length > 0 && (
            <div className="mb-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-2">I'm already in this game</p>
              <div className="space-y-2">
                {players.map(p => {
                  const inv = investigators.find(i => i.name === p.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <button key={p.id} onClick={() => handleSetName(p.player_name)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left active:scale-98"
                      style={{ background: cls.bg, border: `1px solid ${cls.border}` }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: "rgba(10,8,5,0.4)", color: cls.hex, border: `1px solid ${cls.border}` }}>
                        {p.investigator[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-decorative font-bold text-sm text-ark-text">{p.player_name}</p>
                        <p className="text-xs" style={{ color: cls.hex }}>{p.investigator} · {inv?.class}</p>
                      </div>
                      <span className="text-xs font-bold font-mono" style={{ color: cls.hex }}>That&apos;s me →</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          {players.length > 0 && canAddNew && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: "#3d3020" }} />
              <span className="text-xs text-ark-text-muted font-mono">or</span>
              <div className="flex-1 h-px" style={{ background: "#3d3020" }} />
            </div>
          )}

          {/* PATH B — Join as new player */}
          {canAddNew && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-2">Join as a new player</p>
              <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(26,20,16,0.8)", border: "1px solid rgba(201,151,58,0.2)" }}>
                <input value={joiningName} onChange={e => setJoiningName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleJoinGame()}
                  placeholder="Your name"
                  className="ark-input w-full px-3 py-2.5 rounded-lg text-sm" />
                <select value={joiningInvestigator} onChange={e => setJoiningInvestigator(e.target.value)}
                  className="ark-input w-full px-3 py-2.5 rounded-lg text-sm">
                  {(availableInvestigators.length > 0 ? availableInvestigators : investigators).map(inv => (
                    <option key={inv.name} value={inv.name}>{inv.name} ({inv.class})</option>
                  ))}
                </select>
                {(() => {
                  const selInv = investigators.find(i => i.name === joiningInvestigator);
                  if (!selInv) return null;
                  const cls = CLASS_COLORS[selInv.class ?? "Guardian"];
                  return (
                    <div className="rounded-lg p-2.5 grid grid-cols-6 gap-1.5 text-center" style={{ background: cls.bg, border: `1px solid ${cls.border}` }}>
                      {[
                        { label: "HP", val: selInv.health, color: "#d96b6b" },
                        { label: "SAN", val: selInv.sanity, color: "#a888e8" },
                        { label: "WIL", val: selInv.willpower, color: "#a888e8" },
                        { label: "INT", val: selInv.intellect, color: "#6aabf7" },
                        { label: "COM", val: selInv.combat, color: "#d96b6b" },
                        { label: "AGI", val: selInv.agility, color: "#5bbf8a" },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="text-[9px] font-mono text-ark-text-muted">{s.label}</div>
                          <div className="font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <button onClick={handleJoinGame} disabled={joiningPlayer || !joiningName.trim()}
                  className="btn-gold w-full py-3 text-sm rounded-xl font-bold disabled:opacity-40">
                  {joiningPlayer ? "Joining…" : "Join Game →"}
                </button>
              </div>
            </div>
          )}

          {!canAddNew && players.length > 0 && (
            <div className="rounded-xl p-4 text-center text-xs font-mono" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)", color: "#d96b6b" }}>
              Game is full (4/4). Select your investigator above to identify yourself.
            </div>
          )}
        </main>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // ── YOUR TURN TAKEOVER — shown when it's this device's turn
  // ══════════════════════════════════════════════════════════
  if (isMyTurn && turnState.phase === "investigation" && !selectedAction && !viewBoardMode) {
    const inv = investigators.find(i => i.name === currentPlayer.investigator);
    const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
    const actionsLeft = 3 - turnState.actionsUsed;

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0c0f14" }}>
        <Navbar />

        {/* Big YOUR TURN header */}
        <div className="flex-1 flex flex-col items-center justify-start pt-8 px-4 max-w-lg mx-auto w-full">

          {/* Phase + Round badge */}
          <div className="flex items-center gap-3 mb-6 text-xs font-mono">
            <span className="px-3 py-1 rounded-full border" style={{ background: `${currentPhase.color}15`, borderColor: `${currentPhase.color}40`, color: currentPhase.color }}>
              {currentPhase.label} Phase
            </span>
            <span className="text-ark-text-muted">Round {turnState.round}</span>
          </div>

          {/* Your Turn banner */}
          <div className="w-full rounded-2xl p-6 mb-6 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(145deg, ${cls.bg}, rgba(10,8,5,0.95))`, border: `2px solid ${cls.border}`, boxShadow: `0 0 40px ${cls.glow}` }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${cls.hex}08, transparent 70%)` }} />
            <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: cls.hex }}>It&apos;s your turn</p>
            <h1 className="font-display font-extrabold text-4xl text-ark-text mb-1">{currentPlayer.player_name}</h1>
            <p className="text-sm font-mono" style={{ color: cls.hex }}>{currentPlayer.investigator}</p>
            {inv && <p className="text-xs text-ark-text-muted mt-1">{inv.class}</p>}
          </div>

          {/* Actions remaining */}
          <div className="flex items-center gap-3 mb-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={i < actionsLeft
                    ? { background: `linear-gradient(135deg, ${cls.hex}, ${cls.hex}88)`, boxShadow: `0 0 12px ${cls.glow}`, color: "#fff" }
                    : { background: "rgba(26,20,16,0.6)", border: "1px solid #3d3020", color: "#3d3020" }}>
                  <ActionSymbol size={18} />
                </div>
                <span className="text-[9px] font-mono" style={{ color: i < actionsLeft ? cls.hex : "#3d3020" }}>
                  {i < actionsLeft ? "ready" : "spent"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-ark-text-muted text-sm mb-6">{actionsLeft} action{actionsLeft !== 1 ? "s" : ""} remaining</p>

          {/* Action grid */}
          <div className="w-full mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted text-center mb-3">Choose an action to log</p>
            <div className="grid grid-cols-3 gap-2">
              {ACTIONS.map(action => (
                <button key={action.id} onClick={() => setSelectedAction(action)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all duration-200 active:scale-95"
                  style={{ background: action.bg, border: `1px solid ${action.color}30` }}>
                  {action.skill && (
                    <div className="flex items-center gap-1">
                      <SkillIcon skill={action.skill} size={14} />
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <ActionSymbol size={12} />
                    <span className="text-[11px] font-mono font-semibold" style={{ color: action.color }}>{action.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* View Board + Undo + End Turn */}
          <div className="w-full flex gap-2">
            <button onClick={() => setViewBoardMode(true)}
              className="flex-1 py-3.5 rounded-xl font-decorative font-bold text-sm tracking-wide transition-all active:scale-98"
              style={{ background: "rgba(106,171,247,0.08)", border: "1px solid rgba(106,171,247,0.3)", color: "#6aabf7" }}>
              🗺 Board
            </button>
            <button onClick={handleUndoLastAction}
              disabled={actionLog.length === 0 || actionLog.every(e => e.action === "Undo" || e.action === "Log Cleared")}
              className="px-4 py-3.5 rounded-xl font-decorative font-bold text-sm tracking-wide transition-all active:scale-98 disabled:opacity-30"
              style={{ background: "rgba(232,168,74,0.08)", border: "1px solid rgba(232,168,74,0.3)", color: "#e8a84a" }}>
              ↩ Undo
            </button>
            <button onClick={handleEndTurn}
              className="flex-1 py-3.5 rounded-xl font-decorative font-bold text-sm tracking-wide transition-all active:scale-98"
              style={{ background: "linear-gradient(135deg, #3d3020, #2a2016)", border: "1px solid #5c4a2a", color: "#9a8870" }}>
              End Turn →
            </button>
          </div>

          {/* My stats peek */}
          {myPlayer && (
            <div className="w-full mt-4 rounded-xl p-4 grid grid-cols-4 gap-2" style={{ background: "rgba(26,20,16,0.6)", border: "1px solid #2e2318" }}>
              {[
                { label: "DMG", val: myPlayer.damage, max: inv?.health ?? 9, color: "#d96b6b", field: "damage" as const },
                { label: "HOR", val: myPlayer.horror, max: inv?.sanity ?? 7, color: "#a888e8", field: "horror" as const },
                { label: "RES", val: myPlayer.resources, max: null, color: "#c9973a", field: "resources" as const },
                { label: "CLU", val: myPlayer.clues, max: null, color: "#6aabf7", field: "clues" as const },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center gap-1 py-2 rounded-lg" style={{ background: "rgba(10,8,5,0.4)" }}>
                  <span className="text-[9px] font-mono text-ark-text-muted">{s.label}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleStatChange(myPlayer, s.field, -1)} className="w-5 h-5 rounded text-xs font-bold" style={{ color: s.color }}>−</button>
                    <span className="font-mono font-bold text-base" style={{ color: s.color }}>{s.val}</span>
                    <button onClick={() => handleStatChange(myPlayer, s.field, 1)} className="w-5 h-5 rounded text-xs font-bold" style={{ color: s.color }}>+</button>
                  </div>
                  {s.max && <span className="text-[9px] text-ark-text-muted">/ {s.max}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Action confirmation modal (in YOUR TURN context) ──────
  if (isMyTurn && selectedAction && turnState.phase === "investigation") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#0c0f14" }}>
        <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
          style={{ background: "#1a1410", border: `1px solid ${selectedAction.color}40`, boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${selectedAction.color}12` }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: selectedAction.bg, border: `1px solid ${selectedAction.color}30` }}>
              {selectedAction.skill
                ? <SkillIcon skill={selectedAction.skill} size={24} />
                : <ActionSymbol size={24} />}
            </div>
            <div>
              <h3 className="font-decorative font-bold text-xl text-ark-text">{selectedAction.label}</h3>
              <p className="text-ark-text-muted text-xs leading-relaxed">{selectedAction.desc}</p>
            </div>
          </div>

          {selectedAction.skill && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(10,8,5,0.5)", border: "1px solid #3d3020" }}>
              <SkillIcon skill={selectedAction.skill} size={14} />
              <span className="text-ark-text-muted">Tests your </span>
              <span className="font-bold text-ark-text">{{WIL:"Willpower",INT:"Intellect",COM:"Combat",AGI:"Agility"}[selectedAction.skill] ?? selectedAction.skill}</span>
              <span className="text-ark-text-muted">skill</span>
            </div>
          )}

          <button onClick={() => setLearnModalActionId(selectedAction.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all w-full"
            style={{ background: `${selectedAction.color}10`, border: `1px solid ${selectedAction.color}30`, color: selectedAction.color }}>
            📖 Learn more about this action →
          </button>

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted block mb-2">Add detail (optional)</label>
            <input value={actionDetail} onChange={e => setActionDetail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogAction()}
              placeholder={`e.g. "Investigated Library — passed +2"`}
              className="ark-input w-full px-3 py-2.5 rounded-lg text-sm" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setSelectedAction(null)} className="btn-ghost flex-1 py-2.5 text-sm rounded-lg">← Back</button>
            <button onClick={handleLogAction}
              className="flex-1 py-2.5 text-sm rounded-lg font-bold transition-all"
              style={{ background: `linear-gradient(135deg, ${selectedAction.color}cc, ${selectedAction.color}88)`, color: "#0a0805" }}>
              Log Action
            </button>
          </div>
        </div>

        {/* ── Inline Learn Modal ── */}
        {learnModalActionId && (() => {
          const actionData = ACTION_DATA.find(a => a.id === learnModalActionId);
          const actionDef = ACTIONS.find(a => a.id === learnModalActionId);
          if (!actionData) return null;
          const color = actionDef?.color ?? "#c9973a";
          return (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
              style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
              onClick={e => { if (e.target === e.currentTarget) setLearnModalActionId(null); }}>
              <div className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
                style={{ background: "#141008", border: `1px solid ${color}30`, maxHeight: "85vh" }}>
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${color}20`, background: `${color}08` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                    {actionDef?.skill ? <SkillIcon skill={actionDef.skill} size={20} /> : <ActionSymbol size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-decorative font-bold text-lg text-ark-text">{actionData.name}</h3>
                    <p className="text-xs text-ark-text-muted">{actionData.tagline}</p>
                  </div>
                  <button onClick={() => setLearnModalActionId(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-ark-text-muted hover:text-ark-text transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)" }}>✕</button>
                </div>

                {/* Scrollable body */}
                <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
                  {/* Description */}
                  <p className="text-sm text-ark-text leading-relaxed">{actionData.description}</p>

                  {/* Steps */}
                  {actionData.steps && actionData.steps.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color }}>How it works</p>
                      <div className="space-y-1.5">
                        {actionData.steps.map(step => (
                          <div key={step.number} className="flex items-start gap-3 px-3 py-2.5 rounded-lg" style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
                            <div className="w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[10px] flex-shrink-0 mt-0.5"
                              style={{ background: `${color}25`, color }}>{step.number}</div>
                            <p className="text-sm text-ark-text leading-snug">{step.instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Example */}
                  {actionData.example && (
                    <div className="rounded-lg px-4 py-3" style={{ background: "rgba(91,191,138,0.07)", border: "1px solid rgba(91,191,138,0.25)" }}>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-1.5" style={{ color: "#5bbf8a" }}>Example</p>
                      <p className="text-xs text-ark-text leading-relaxed">{actionData.example.narrative}</p>
                    </div>
                  )}

                  {/* Edge cases */}
                  {actionData.edgeCases && actionData.edgeCases.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "#e8a84a" }}>Common questions</p>
                      <div className="space-y-2">
                        {actionData.edgeCases.map((ec, i) => (
                          <div key={i} className="rounded-lg px-3 py-2.5" style={{ background: "rgba(232,168,74,0.06)", border: "1px solid rgba(232,168,74,0.2)" }}>
                            <p className="text-[11px] font-bold mb-1" style={{ color: "#e8a84a" }}>{ec.question}</p>
                            <p className="text-xs text-ark-text-muted leading-relaxed">{ec.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* When to use */}
                  {actionData.whenToUse && actionData.whenToUse.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "#6aabf7" }}>When to use this</p>
                      <ul className="space-y-1">
                        {actionData.whenToUse.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-ark-text-muted">
                            <span style={{ color: "#6aabf7" }}>·</span>{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: `1px solid ${color}20` }}>
                  <button onClick={() => setLearnModalActionId(null)}
                    className="w-full py-2.5 rounded-xl font-bold font-decorative text-sm transition-all"
                    style={{ background: `linear-gradient(135deg, ${color}cc, ${color}88)`, color: "#0a0805" }}>
                    Got it — back to my turn
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // ── WAITING / SPECTATOR / NON-MYTHOS-LEAD VIEW ────────────
  // ══════════════════════════════════════════════════════════
  return (
    <>
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <BackButton href="/play" label="All Sessions" />

        {/* Phase flash overlay */}
        {phaseFlash && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center"
            style={{ background: `radial-gradient(ellipse at center, ${currentPhase.color}30, transparent 70%)`, animation: "fadeOut 1.2s ease-out forwards" }}>
            <p className="font-display font-extrabold text-5xl opacity-70" style={{ color: currentPhase.color }}>
              {currentPhase.label.toUpperCase()} PHASE
            </p>
          </div>
        )}

        {/* ── Back to Your Turn banner ── */}
        {viewBoardMode && isMyTurn && turnState.phase === "investigation" && (
          <div className="rounded-xl p-3 mb-4 flex items-center justify-between gap-3"
            style={{ background: "rgba(201,151,58,0.12)", border: "2px solid rgba(201,151,58,0.5)" }}>
            <p className="font-decorative font-bold text-sm" style={{ color: "#c9973a" }}>⚡ It&apos;s your turn — {3 - turnState.actionsUsed} action{3 - turnState.actionsUsed !== 1 ? "s" : ""} remaining</p>
            <button onClick={() => setViewBoardMode(false)}
              className="px-4 py-2 rounded-lg text-xs font-bold font-decorative transition-all flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#0a0805" }}>
              ← Your Turn
            </button>
          </div>
        )}

        {/* ── Identity banner (pulsing if not identified) ── */}
        {!myPlayer && (
          <div onClick={() => setShowNamePicker(true)}
            className="w-full rounded-xl p-4 mb-4 cursor-pointer transition-all"
            style={{ background: "rgba(201,151,58,0.15)", border: "2px solid rgba(201,151,58,0.5)", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
            <p className="text-center font-decorative font-bold text-base" style={{ color: "#c9973a" }}>
              Tap to identify yourself →
            </p>
          </div>
        )}

        {/* ── Identity bar ── */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <p className="text-ark-text-muted text-[10px] uppercase tracking-widest font-mono">Session</p>
              <h1 className="font-mono font-bold text-xl tracking-wider" style={{ color: "#c9973a" }}>{sessionCode}</h1>
            </div>
            <div className="h-8 w-px" style={{ background: "#3d3020" }} />
            <div>
              <p className="text-ark-text-muted text-[10px] uppercase tracking-widest font-mono">Round</p>
              {showRoundEdit ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number" min="1"
                    value={roundEditValue}
                    onChange={e => setRoundEditValue(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleFixRound(parseInt(roundEditValue)); if (e.key === "Escape") setShowRoundEdit(false); }}
                    className="ark-input w-14 px-2 py-0.5 rounded text-sm font-mono font-bold text-center"
                    autoFocus
                  />
                  <button onClick={() => handleFixRound(parseInt(roundEditValue))} className="text-[10px] px-1.5 py-1 rounded font-bold" style={{ background: "rgba(91,191,138,0.2)", color: "#5bbf8a" }}>✓</button>
                  <button onClick={() => setShowRoundEdit(false)} className="text-[10px] px-1.5 py-1 rounded font-bold" style={{ background: "rgba(192,57,43,0.15)", color: "#d96b6b" }}>✕</button>
                </div>
              ) : (
                <button onClick={() => { if (isLead) { setRoundEditValue(String(turnState.round)); setShowRoundEdit(true); } }}
                  className={`font-decorative font-bold text-xl text-ark-text ${isLead ? "cursor-pointer hover:text-ark-text-dim" : ""}`}
                  title={isLead ? "Click to correct round number" : ""}>
                  {turnState.round}{isLead && <span className="text-[9px] text-ark-text-muted ml-1">✏</span>}
                </button>
              )}
            </div>
            <div className="h-8 w-px" style={{ background: "#3d3020" }} />
            {/* Phase badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: `${currentPhase.color}12`, border: `1px solid ${currentPhase.color}35` }}>
              <div className="w-2 h-2 rounded-full" style={{ background: currentPhase.color }} />
              <span className="font-mono font-bold text-xs" style={{ color: currentPhase.color }}>{currentPhase.label} Phase</span>
            </div>
            <div className="h-8 w-px" style={{ background: "#3d3020" }} />
            {/* Act badge */}
            {turnState.scenarioNumber && (
              <>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(124,92,191,0.12)", border: "1px solid rgba(124,92,191,0.35)" }}>
                  <span className="font-mono font-bold text-xs" style={{ color: "#a888e8" }}>Act {turnState.scenarioNumber}</span>
                </div>
                <div className="h-8 w-px" style={{ background: "#3d3020" }} />
              </>
            )}
            {/* Doom */}
            <div className="flex items-center gap-1.5">
              <DoomIcon size={14} color={doomDanger ? "#d96b6b" : "#a888e8"} />
              <span className="font-mono font-bold text-base" style={{ color: doomDanger ? "#d96b6b" : "#a888e8" }}>
                {turnState.doom}<span className="text-sm font-normal text-ark-text-muted">/{turnState.doomThreshold}</span>
              </span>
              {doomDanger && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded animate-pulse" style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", color: "#d96b6b" }}>ADVANCE!</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Identity: who am I */}
            {myPlayer ? (
              <button onClick={() => setShowNamePicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all"
                style={{ background: `${CLASS_COLORS[investigators.find(i=>i.name===myPlayer.investigator)?.class??"Guardian"].bg}`, border: `1px solid ${CLASS_COLORS[investigators.find(i=>i.name===myPlayer.investigator)?.class??"Guardian"].border}`, color: CLASS_COLORS[investigators.find(i=>i.name===myPlayer.investigator)?.class??"Guardian"].hex }}>
                👤 You: {myPlayer.player_name}
              </button>
            ) : (
              <button onClick={() => setShowNamePicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border-2 animate-pulse"
                style={{ background: "rgba(201,151,58,0.1)", border: "2px solid rgba(201,151,58,0.5)", color: "#c9973a" }}>
                👤 Identify Me
              </button>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs" style={{ background: "rgba(58,158,107,0.1)", border: "1px solid rgba(58,158,107,0.25)" }}>
              <span className="live-dot" />
              <span style={{ color: "#5bbf8a" }}>Live</span>
            </div>
            <button onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}>
              {copied ? "✓ Copied!" : "Share Link"}
            </button>
          </div>
        </div>

        {/* ── Name picker modal ── */}
        {showNamePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "#1a1410", border: "1px solid rgba(201,151,58,0.3)" }}>
              <h3 className="font-decorative font-bold text-lg text-ark-text">Which investigator are you?</h3>
              <p className="text-ark-text-muted text-sm">Select your name so the app knows when it&apos;s your turn.</p>
              <div className="space-y-2">
                {players.map(p => {
                  const inv = investigators.find(i => i.name === p.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <button key={p.id} onClick={() => handleSetName(p.player_name)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                      style={{ background: cls.bg, border: `1px solid ${cls.border}` }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold" style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex }}>
                        {p.investigator[0]}
                      </div>
                      <div>
                        <p className="font-decorative font-bold text-sm text-ark-text">{p.player_name}</p>
                        <p className="text-xs" style={{ color: cls.hex }}>{p.investigator}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {players.length === 0 && <p className="text-ark-text-muted text-sm text-center">No investigators yet — add them in the Board tab.</p>}
              <button onClick={() => setShowNamePicker(false)} className="btn-ghost w-full py-2 text-sm rounded-lg">Close</button>
            </div>
          </div>
        )}

        {/* ══ DOOM & ACT STATUS BAR — always prominent ══ */}
        <div className="rounded-2xl mb-4 overflow-hidden" style={{ border: `2px solid ${doomDanger ? "rgba(192,57,43,0.5)" : "rgba(124,92,191,0.35)"}`, background: "linear-gradient(135deg, rgba(20,14,30,0.97), rgba(10,8,5,0.98))", boxShadow: doomDanger ? "0 0 24px rgba(192,57,43,0.15)" : "0 0 16px rgba(124,92,191,0.08)" }}>

          {/* Top strip: Agenda + Act side by side */}
          <div className="grid grid-cols-2" style={{ borderBottom: `1px solid ${doomDanger ? "rgba(192,57,43,0.25)" : "rgba(124,92,191,0.2)"}` }}>
            {/* DOOM side */}
            <div className="px-4 py-3" style={{ borderRight: `1px solid ${doomDanger ? "rgba(192,57,43,0.2)" : "rgba(124,92,191,0.15)"}` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <DoomIcon size={12} color={doomDanger ? "#d96b6b" : "#a888e8"} />
                <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: doomDanger ? "#d96b6b" : "#a888e8" }}>Agenda</span>
                {doomDanger && <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded animate-pulse" style={{ background: "rgba(192,57,43,0.2)", color: "#d96b6b" }}>ADVANCE!</span>}
              </div>
              <p className="text-[11px] font-decorative font-bold text-ark-text truncate mb-1.5">{turnState.agendaName}</p>
              {/* Doom pips */}
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: turnState.doomThreshold }).map((_, i) => (
                  <button key={i}
                    onClick={() => isLead && pushTurnState({ ...turnState, doom: i < turnState.doom ? i : i + 1 })}
                    disabled={!isLead}
                    className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                    style={i < turnState.doom
                      ? { background: doomDanger ? "rgba(192,57,43,0.7)" : "rgba(124,92,191,0.7)", border: `1px solid ${doomDanger ? "#d96b6b" : "#7c5cbf"}`, boxShadow: `0 0 6px ${doomDanger ? "rgba(192,57,43,0.4)" : "rgba(124,92,191,0.4)"}` }
                      : { background: "rgba(10,8,5,0.5)", border: `1px solid ${doomDanger ? "rgba(192,57,43,0.25)" : "#3d3020"}` }}>
                    {i < turnState.doom && <DoomIcon size={10} color={doomDanger ? "#d96b6b" : "#a888e8"} />}
                  </button>
                ))}
                <span className="text-[10px] font-mono font-bold ml-1" style={{ color: doomDanger ? "#d96b6b" : "#a888e8" }}>{turnState.doom}/{turnState.doomThreshold}</span>
              </div>
            </div>

            {/* ACT side */}
            <div className="px-4 py-3">
              {(() => {
                const totalClues = players.reduce((sum, p) => sum + p.clues, 0);
                const needed = turnState.cluesRequired ?? 0;
                const canAdvance = totalClues >= needed;
                return (
                  <>
                    <div className="flex items-center gap-1.5 mb-1">
                      <ClueIcon size={12} color={canAdvance ? "#6aabf7" : "#4a6a8a"} />
                      <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: canAdvance ? "#6aabf7" : "#4a6a8a" }}>Act</span>
                      {turnState.scenarioNumber && <span className="text-[9px] font-mono" style={{ color: "#6a5840" }}>#{turnState.scenarioNumber}</span>}
                      {canAdvance && <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded animate-pulse" style={{ background: "rgba(106,171,247,0.15)", color: "#6aabf7" }}>READY!</span>}
                    </div>
                    <p className="text-[11px] font-decorative font-bold text-ark-text truncate mb-1.5">{turnState.actName}</p>
                    {/* Clue progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(10,8,5,0.5)", border: "1px solid #3d3020" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((totalClues / Math.max(1, needed)) * 100, 100)}%`, background: canAdvance ? "linear-gradient(90deg, #3a6ab8, #6aabf7)" : "linear-gradient(90deg, #2a4a68, #4a8ab8)" }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold flex-shrink-0" style={{ color: canAdvance ? "#6aabf7" : "#4a6a8a" }}>{totalClues}/{needed}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Bottom strip: lead actions */}
          {isLead && (
            <div className="px-3 py-2 flex items-center gap-2 flex-wrap" style={{ background: "rgba(10,8,5,0.4)" }}>
              <button onClick={() => setShowCampaignPicker(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-decorative transition-all"
                style={{ background: "rgba(124,92,191,0.12)", border: "1px solid rgba(124,92,191,0.3)", color: "#a888e8" }}>
                📖 Campaign
              </button>
              <button onClick={handleAdvanceAct}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-decorative transition-all"
                style={{ background: "rgba(124,92,191,0.12)", border: "1px solid rgba(124,92,191,0.3)", color: "#a888e8" }}>
                Advance Act →
              </button>
              {turnState.campaignId && turnState.campaignId !== "custom" && (
                <button onClick={handleAdvanceScenario}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-decorative transition-all"
                  style={{ background: "rgba(58,158,107,0.1)", border: "1px solid rgba(58,158,107,0.3)", color: "#5bbf8a" }}>
                  Next Scenario ↗
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Campaign picker modal ── */}
        {showCampaignPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#1a1410", border: "1px solid rgba(124,92,191,0.3)" }}>
              <h3 className="font-decorative font-bold text-lg text-ark-text">Select Campaign & Scenario</h3>

              {selectedCampaignId === null ? (
                <div className="space-y-2">
                  {CAMPAIGNS.map(campaign => (
                    <button key={campaign.id}
                      onClick={() => setSelectedCampaignId(campaign.id)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left"
                      style={{ background: "rgba(124,92,191,0.08)", border: "1px solid rgba(124,92,191,0.25)" }}>
                      <div className="flex-1">
                        <p className="font-decorative font-bold text-sm text-ark-text">{campaign.name}</p>
                        <p className="text-xs text-ark-text-muted">{campaign.subtitle}</p>
                      </div>
                      <span className="text-ark-text-muted text-xs">→</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCampaignId(null)}
                    className="text-xs text-ark-text-muted hover:text-ark-text mb-2">
                    ← Back to campaigns
                  </button>
                  {CAMPAIGNS.find(c => c.id === selectedCampaignId)?.scenarios.map(scenario => (
                    <button key={scenario.id}
                      onClick={() => handleSelectScenario(selectedCampaignId, scenario.id)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left"
                      style={{ background: "rgba(91,191,138,0.08)", border: "1px solid rgba(91,191,138,0.25)" }}>
                      <div className="flex-1">
                        <p className="font-decorative font-bold text-sm text-ark-text">{scenario.name}</p>
                        <p className="text-xs text-ark-text-muted">{scenario.agendaName}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <button onClick={() => { setShowCampaignPicker(false); setSelectedCampaignId(null); }} className="btn-ghost w-full py-2 text-sm rounded-lg">Close</button>
            </div>
          </div>
        )}

        {/* ── Phase banner (non-investigation or not-your-turn) ── */}
        {turnState.phase !== "investigation" && (
          <div className="rounded-xl p-4 mb-4 relative overflow-hidden"
            style={{ background: `${currentPhase.color}10`, border: `1px solid ${currentPhase.color}40` }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: currentPhase.color }} />
                  <p className="font-decorative font-bold text-base" style={{ color: currentPhase.color }}>{currentPhase.label} Phase</p>
                  <span className="text-xs text-ark-text-muted">— Round {turnState.round}</span>
                </div>
                <p className="text-sm text-ark-text-dim leading-relaxed">{currentPhase.desc}</p>
              </div>
              {isLead && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* Phase-specific quick log buttons for lead */}
                  {turnState.phase === "mythos" && (
                    <button onClick={async () => { await handleLeadPhaseAction("Doom Placed", `Placed 1 doom — now ${turnState.doom + 1}/${turnState.doomThreshold}`); pushTurnState({ ...turnState, doom: turnState.doom + 1 }); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                      style={{ background: "rgba(124,92,191,0.15)", border: "1px solid rgba(124,92,191,0.4)", color: "#a888e8" }}>
                      + Place Doom
                    </button>
                  )}
                  {turnState.phase === "mythos" && (
                    <button onClick={() => handleLeadPhaseAction("Encounter Cards Drawn", "All investigators drew encounter cards")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                      style={{ background: "rgba(124,92,191,0.1)", border: "1px solid rgba(124,92,191,0.3)", color: "#a888e8" }}>
                      Log Encounter Draw
                    </button>
                  )}
                  {turnState.phase === "enemy" && (
                    <button onClick={() => handleLeadPhaseAction("Hunter Enemies Moved", "Hunter enemies moved toward nearest investigator")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                      style={{ background: "rgba(217,107,107,0.12)", border: "1px solid rgba(217,107,107,0.4)", color: "#d96b6b" }}>
                      Log Hunter Move
                    </button>
                  )}
                  {turnState.phase === "enemy" && (
                    <button onClick={() => handleLeadPhaseAction("Enemies Attacked", "All engaged ready enemies attacked")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                      style={{ background: "rgba(217,107,107,0.1)", border: "1px solid rgba(217,107,107,0.3)", color: "#d96b6b" }}>
                      Log Enemy Attacks
                    </button>
                  )}
                  {turnState.phase === "upkeep" && (
                    <button onClick={() => handleLeadPhaseAction("Upkeep Resolved", "All cards readied, each investigator drew 1 card and gained 1 resource")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                      style={{ background: "rgba(91,191,138,0.12)", border: "1px solid rgba(91,191,138,0.4)", color: "#5bbf8a" }}>
                      Log Upkeep Done
                    </button>
                  )}
                  <button onClick={handleAdvancePhase}
                    className="px-4 py-2 rounded-xl text-sm font-bold font-decorative transition-all"
                    style={{ background: `linear-gradient(135deg, ${currentPhase.color}cc, ${currentPhase.color}88)`, color: "#0a0805", boxShadow: `0 0 16px ${currentPhase.color}40` }}>
                    Advance → {PHASES[(PHASES.findIndex(p=>p.id===turnState.phase)+1)%4].label}
                  </button>
                </div>
              )}
              {!isLead && (
                <p className="text-xs text-ark-text-muted font-mono">{leadPlayer?.player_name ?? "Lead"} (Lead) is managing this phase</p>
              )}
            </div>
          </div>
        )}

        {/* ── Active turn indicator (when it's NOT my turn during investigation) ── */}
        {turnState.phase === "investigation" && currentPlayer && !isMyTurn && (
          <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
            style={{ background: "rgba(26,20,16,0.7)", border: "1px solid #3d3020" }}>
            {(() => {
              const inv = investigators.find(i => i.name === currentPlayer.investigator);
              const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
              return (<>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex }}>{currentPlayer.investigator[0]}</div>
                <div className="flex-1">
                  <span className="font-decorative font-bold text-sm text-ark-text">{currentPlayer.player_name}</span>
                  <span className="text-ark-text-muted text-xs ml-2">is taking their turn…</span>
                </div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={i < (3 - turnState.actionsUsed) ? { background: cls.bg, border: `1px solid ${cls.border}` } : { background: "rgba(26,20,16,0.6)", border: "1px solid #3d3020" }}>
                      <ActionSymbol size={12} />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-ark-text-muted">{3 - turnState.actionsUsed} left</span>
              </>);
            })()}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: "rgba(26,20,16,0.8)", border: "1px solid #3d3020" }}>
          {(["board","enemies","log","reference"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-decorative tracking-wide transition-all duration-200 whitespace-nowrap"
              style={activeTab === tab
                ? { background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#0a0805", boxShadow: "0 2px 8px rgba(201,151,58,0.3)" }
                : { color: "#6b5840" }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* ── BOARD TAB ──────────────────────────── */}
        {activeTab === "board" && (
          <div className="space-y-5">

            {/* Lead panel */}
            {leadPlayer && (
              <div className="rounded-xl p-4 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(201,151,58,0.07), rgba(10,8,5,0.95))", border: "1px solid rgba(201,151,58,0.3)" }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.5), transparent)" }} />
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #c9973a, #8b6914)", boxShadow: "0 0 16px rgba(201,151,58,0.35)" }}>
                      <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current" style={{ color: "#0a0805" }}><path d="M10 2L12.4 7.5H18L13.4 11L15.3 17L10 13.5L4.7 17L6.6 11L2 7.5H7.6L10 2Z"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-decorative uppercase tracking-widest" style={{ color: "#c9973a" }}>Lead Investigator</p>
                      <p className="font-decorative font-bold text-base text-ark-text">{leadPlayer.player_name}</p>
                      <p className="text-xs text-ark-text-muted">{leadPlayer.investigator}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:ml-auto">
                    {players.length > 1 && (
                      <>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-ark-text-muted">Change Lead</p>
                        <div className="flex flex-wrap gap-1">
                          {players.map((p, idx) => (
                            <button key={p.id}
                              onClick={() => pushTurnState({ ...turnState, leadInvestigatorIdx: idx })}
                              className="px-2 py-1 rounded text-[10px] font-decorative font-semibold transition-all"
                              style={idx === turnState.leadInvestigatorIdx
                                ? { background: "rgba(201,151,58,0.25)", border: "1px solid rgba(201,151,58,0.5)", color: "#c9973a" }
                                : { background: "transparent", border: "1px solid #3d3020", color: "#5a4838" }}>
                              {p.player_name}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {isLead && (
                      <button onClick={() => setReorderMode(!reorderMode)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                        style={{ background: reorderMode ? "rgba(91,191,138,0.15)" : "rgba(201,151,58,0.08)", border: reorderMode ? "1px solid rgba(91,191,138,0.4)" : "1px solid rgba(201,151,58,0.25)", color: reorderMode ? "#5bbf8a" : "#c9973a" }}>
                        {reorderMode ? "✓ Done" : "⇅ Reorder Turn"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add investigator */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted">Investigators ({players.length})</h3>
                <button onClick={() => setShowAddPlayer(!showAddPlayer)}
                  className="text-xs font-semibold font-decorative px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: "rgba(201,151,58,0.08)", border: "1px solid rgba(201,151,58,0.25)", color: "#c9973a" }}>
                  + Add Investigator
                </button>
              </div>

              {showAddPlayer && (
                <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: "rgba(26,20,16,0.8)", border: "1px solid rgba(201,151,58,0.2)" }}>
                  <h4 className="font-decorative font-semibold text-sm text-ark-text">Add Investigator</h4>
                  <input value={addingName} onChange={e => setAddingName(e.target.value)} placeholder="Player name"
                    className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                  <select value={addingInvestigator} onChange={e => setAddingInvestigator(e.target.value)} className="ark-input w-full px-3 py-2 rounded-lg text-sm">
                    {investigators.map(inv => <option key={inv.name} value={inv.name}>{inv.name} ({inv.class})</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddPlayer(false)} className="btn-ghost flex-1 py-2 text-sm rounded-lg">Cancel</button>
                    <button onClick={handleAddPlayer} disabled={addingPlayer || !addingName.trim()} className="btn-gold flex-1 py-2 text-sm rounded-lg disabled:opacity-40">
                      {addingPlayer ? "Adding…" : "Add to Session"}
                    </button>
                  </div>
                </div>
              )}

              {players.length === 0 ? (
                <div className="rounded-xl p-10 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed #3d3020" }}>
                  <p className="text-ark-text-muted text-sm">No investigators yet — add one above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {orderedPlayers.map((player, idx) => {
                    const inv = investigators.find(i => i.name === player.investigator);
                    const isActive = idx === turnState.currentPlayerIdx && turnState.phase === "investigation";
                    const isThisLead = idx === turnState.leadInvestigatorIdx;
                    const isMe = player.player_name === myPlayerName;
                    const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                    const healthPct = Math.min((player.damage / (inv?.health ?? 9)) * 100, 100);
                    const sanityPct = Math.min((player.horror / (inv?.sanity ?? 7)) * 100, 100);
                    const isDefeated = player.damage >= (inv?.health ?? 9);
                    const isInsane = player.horror >= (inv?.sanity ?? 7);
                    const engagedEnemies = enemies.filter(e => e.engagedPlayerId === player.id);

                    return (
                      <div key={player.id} className="rounded-xl p-4 relative transition-all duration-300"
                        style={{
                          background: "linear-gradient(145deg, #1a1410, #120e09)",
                          border: isMe ? `2px solid ${cls.border}` : isActive ? `1px solid ${cls.border}` : "1px solid #3d3020",
                          boxShadow: isMe ? `0 0 24px ${cls.glow}, 0 4px 20px rgba(0,0,0,0.5)` : isActive ? `0 0 14px ${cls.glow}` : "none",
                        }}>

                        {/* Delete button */}
                        <button onClick={() => handleRemove(player)}
                          className="absolute top-3 right-3 w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-all"
                          style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#d96b6b" }}
                          aria-label={`Remove ${player.player_name}`}>
                          ✕
                        </button>

                        {/* Reorder buttons (if in reorderMode and isLead) */}
                        {reorderMode && isLead && (
                          <div className="absolute left-3 top-3 flex flex-col gap-1">
                            <button onClick={() => handleReorderPlayer(player.id, "up")}
                              disabled={orderedPlayers[0]?.id === player.id}
                              className="w-5 h-5 rounded text-xs flex items-center justify-center transition-all disabled:opacity-30"
                              style={{ background: "rgba(91,191,138,0.2)", border: "1px solid rgba(91,191,138,0.4)", color: "#5bbf8a" }}>
                              ↑
                            </button>
                            <button onClick={() => handleReorderPlayer(player.id, "down")}
                              disabled={orderedPlayers[orderedPlayers.length - 1]?.id === player.id}
                              className="w-5 h-5 rounded text-xs flex items-center justify-center transition-all disabled:opacity-30"
                              style={{ background: "rgba(91,191,138,0.2)", border: "1px solid rgba(91,191,138,0.4)", color: "#5bbf8a" }}>
                              ↓
                            </button>
                          </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-3" style={{ paddingRight: "28px", paddingLeft: reorderMode ? "48px" : "0" }}>
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-decorative font-bold text-sm flex-shrink-0"
                            style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex, boxShadow: `0 0 10px ${cls.glow}` }}>
                            {player.investigator[0]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="font-decorative font-bold text-sm text-ark-text truncate">{player.player_name}</p>
                              {isMe && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: cls.bg, color: cls.hex, border: `1px solid ${cls.border}` }}>YOU</span>}
                              {isActive && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded animate-pulse" style={{ background: `${cls.bg}`, color: cls.hex, border: `1px solid ${cls.border}` }}>ACTIVE</span>}
                              {isThisLead && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded" style={{ background: "rgba(201,151,58,0.15)", color: "#c9973a", border: "1px solid rgba(201,151,58,0.3)" }}>★ LEAD</span>}
                            </div>
                            <p className="text-[11px] text-ark-text-muted">{player.investigator}</p>
                            {inv && <p className="text-[10px]" style={{ color: cls.hex }}>{inv.class}</p>}
                          </div>
                        </div>

                        {/* Status */}
                        {(isDefeated || isInsane) && (
                          <div className="mb-2 px-2 py-1 rounded text-[10px] font-decorative font-bold text-center"
                            style={{ background: isDefeated ? "rgba(192,57,43,0.15)" : "rgba(124,92,191,0.15)", color: isDefeated ? "#d96b6b" : "#a888e8", border: `1px solid ${isDefeated ? "rgba(192,57,43,0.3)" : "rgba(124,92,191,0.3)"}` }}>
                            {isDefeated ? "DEFEATED — Take 1 Physical Trauma" : "INSANE — Take 1 Mental Trauma"}
                          </div>
                        )}

                        {/* Engaged enemies */}
                        {engagedEnemies.length > 0 && (
                          <div className="mb-2 px-2 py-1.5 rounded-lg text-[10px]" style={{ background: "rgba(217,107,107,0.08)", border: "1px solid rgba(217,107,107,0.3)" }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <CombatIcon size={11} color="#d96b6b" />
                              <span className="font-decorative font-bold" style={{ color: "#d96b6b" }}>{engagedEnemies.length} enemy engaged — AoO applies!</span>
                            </div>
                            {engagedEnemies.map(e => (
                              <div key={e.id} className="text-[10px] pl-4" style={{ color: "#c08080" }}>
                                {e.name} • Fght {e.fightVal} / Evd {e.evadeVal} / HP {e.currentDamage}/{e.health}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Health bar */}
                        <div className="mb-2 flex gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[9px] font-mono text-ark-text-muted">Health</span>
                              <span className="text-[9px] font-mono" style={{ color: healthPct > 66 ? "#5bbf8a" : healthPct > 33 ? "#d4922a" : "#c05050" }}>{player.damage}/{inv?.health ?? 9}</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(10,8,5,0.4)" }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${healthPct}%`, background: healthPct > 66 ? "linear-gradient(90deg, #2a7048, #5bbf8a)" : healthPct > 33 ? "linear-gradient(90deg, #8a6010, #d4922a)" : "linear-gradient(90deg, #8e1a0e, #c05050)" }} />
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            <button onClick={() => handleStatChange(player, "damage", -1)} className="w-5 h-5 rounded text-[9px] font-bold" style={{ background: "rgba(58,158,107,0.1)", color: "#5bbf8a" }}>−</button>
                            <button onClick={() => handleStatChange(player, "damage", 1)} className="w-5 h-5 rounded text-[9px] font-bold" style={{ background: "rgba(217,107,107,0.1)", color: "#d96b6b" }}>+</button>
                          </div>
                        </div>

                        {/* Sanity bar */}
                        <div className="mb-2 flex gap-2">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[9px] font-mono text-ark-text-muted">Sanity</span>
                              <span className="text-[9px] font-mono" style={{ color: sanityPct > 66 ? "#5bbf8a" : sanityPct > 33 ? "#d4922a" : "#c05050" }}>{player.horror}/{inv?.sanity ?? 7}</span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(10,8,5,0.4)" }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sanityPct}%`, background: sanityPct > 66 ? "linear-gradient(90deg, #4a68b8, #6aabf7)" : sanityPct > 33 ? "linear-gradient(90deg, #5c6eb5, #8ab3f5)" : "linear-gradient(90deg, #6c4280, #a888e8)" }} />
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            <button onClick={() => handleStatChange(player, "horror", -1)} className="w-5 h-5 rounded text-[9px] font-bold" style={{ background: "rgba(58,158,107,0.1)", color: "#5bbf8a" }}>−</button>
                            <button onClick={() => handleStatChange(player, "horror", 1)} className="w-5 h-5 rounded text-[9px] font-bold" style={{ background: "rgba(124,92,191,0.1)", color: "#a888e8" }}>+</button>
                          </div>
                        </div>

                        {/* Resource stats */}
                        <div className="grid grid-cols-2 gap-1 mb-2.5">
                          {[
                            { label: "Resources", val: player.resources, color: "#c9973a", field: "resources" as const },
                            { label: "Clues", val: player.clues, color: "#6aabf7", field: "clues" as const },
                          ].map(s => (
                            <div key={s.label} className="flex items-center gap-1 py-1 px-2 rounded" style={{ background: "rgba(10,8,5,0.35)" }}>
                              <div className="flex-1">
                                <div className="text-[9px] font-mono text-ark-text-muted">{s.label}</div>
                                <div className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                              </div>
                              <div className="flex gap-0.5">
                                <button onClick={() => handleStatChange(player, s.field, -1)} className="w-4 h-4 rounded text-[8px] font-bold" style={{ background: "rgba(10,8,5,0.5)" }}>−</button>
                                <button onClick={() => handleStatChange(player, s.field, 1)} className="w-4 h-4 rounded text-[8px] font-bold" style={{ background: "rgba(10,8,5,0.5)" }}>+</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Skill stats */}
                        {inv && (
                          <div className="grid grid-cols-4 gap-1 pt-2.5" style={{ borderTop: "1px solid #2e2318" }}>
                            {[
                              { label: "WIL", val: inv.willpower, color: "#a888e8", skill: "WIL" },
                              { label: "INT", val: inv.intellect, color: "#6aabf7", skill: "INT" },
                              { label: "COM", val: inv.combat,    color: "#d96b6b", skill: "COM" },
                              { label: "AGI", val: inv.agility,   color: "#5bbf8a", skill: "AGI" },
                            ].map(s => (
                              <div key={s.label} className="text-center py-1.5 rounded" style={{ background: "rgba(10,8,5,0.35)" }}>
                                <SkillIcon skill={s.skill} size={12} />
                                <div className="text-[9px] text-ark-text-muted font-mono mt-0.5">{s.label}</div>
                                <div className="font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ability */}
                        {inv && (
                          <div className="mt-2.5 pt-2.5 px-2 py-2 rounded-lg" style={{ borderTop: "1px solid #2e2318", background: `${cls.bg}` }}>
                            <p className="text-[9px] font-decorative uppercase tracking-wider mb-0.5" style={{ color: cls.hex }}>Ability</p>
                            <p className="text-[10px] leading-tight" style={{ color: "#8a7860" }}>{inv.ability}</p>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-decorative font-bold text-base text-ark-text">Enemy Tracker</h2>
                <p className="text-xs text-ark-text-muted">Track active enemies, their stats, keywords, and engaged investigator</p>
              </div>
              <button onClick={() => setShowAddEnemy(!showAddEnemy)}
                className="text-xs font-semibold font-decorative px-3 py-1.5 rounded-lg"
                style={{ background: "rgba(217,107,107,0.08)", border: "1px solid rgba(217,107,107,0.3)", color: "#d96b6b" }}>
                + Spawn Enemy
              </button>
            </div>

            {showAddEnemy && (
              <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(217,107,107,0.05)", border: "1px solid rgba(217,107,107,0.25)" }}>
                <h4 className="font-decorative font-bold text-sm" style={{ color: "#d96b6b" }}>Spawn Enemy</h4>
                <input value={newEnemy.name} onChange={e => setNewEnemy(p => ({ ...p, name: e.target.value }))} placeholder="Enemy name" className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                <div className="grid grid-cols-3 gap-2">
                  {(["fightVal","evadeVal","health","damage","horror"] as const).map(f => (
                    <div key={f}>
                      <label className="text-[10px] font-mono uppercase text-ark-text-muted block mb-1">{{fightVal:"Fight",evadeVal:"Evade",health:"HP",damage:"DMG",horror:"HOR"}[f]}</label>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setNewEnemy(p => ({ ...p, [f]: Math.max(0, p[f] - 1) }))} className="w-6 h-6 rounded text-sm font-bold" style={{ background: "rgba(217,107,107,0.1)", color: "#d96b6b" }}>−</button>
                        <span className="font-mono font-bold text-sm w-6 text-center text-ark-text">{newEnemy[f]}</span>
                        <button onClick={() => setNewEnemy(p => ({ ...p, [f]: p[f] + 1 }))} className="w-6 h-6 rounded text-sm font-bold" style={{ background: "rgba(217,107,107,0.1)", color: "#d96b6b" }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-ark-text-muted block mb-1">Keywords</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ENEMY_KEYWORDS.map(k => (
                      <button key={k.key} onClick={() => toggleEnemyKeyword(k.key)}
                        className="px-2 py-1 rounded text-[10px] font-mono font-semibold transition-all"
                        style={newEnemy.keywords.includes(k.key)
                          ? { background: `${k.color}25`, border: `1px solid ${k.color}60`, color: k.color }
                          : { background: "transparent", border: "1px solid #3d3020", color: "#5a4838" }}>
                        {k.key}
                      </button>
                    ))}
                  </div>
                </div>
                {players.length > 0 && (
                  <select value={newEnemy.engagedPlayerId} onChange={e => setNewEnemy(p => ({ ...p, engagedPlayerId: e.target.value }))} className="ark-input w-full px-3 py-2 rounded-lg text-sm">
                    <option value="">-- Aloof / unengaged --</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.player_name} ({p.investigator})</option>)}
                  </select>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setShowAddEnemy(false)} className="btn-ghost flex-1 py-2 text-sm rounded-lg">Cancel</button>
                  <button onClick={handleAddEnemy} disabled={!newEnemy.name.trim()} className="flex-1 py-2 text-sm rounded-lg font-bold disabled:opacity-40" style={{ background: "linear-gradient(135deg, #a03020, #802010)", color: "#fff", border: "1px solid rgba(217,107,107,0.4)" }}>Spawn</button>
                </div>
              </div>
            )}

            {/* Keyword guide */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(217,107,107,0.2)" }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: "rgba(217,107,107,0.05)", borderBottom: "1px solid rgba(217,107,107,0.2)" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">Enemy Keyword Guide</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-ark-border" style={{ background: "rgba(26,20,16,0.6)" }}>
                {ENEMY_KEYWORDS.map(kw => (
                  <div key={kw.key} className="flex items-start gap-3 px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0 mt-0.5" style={{ background: `${kw.color}18`, border: `1px solid ${kw.color}40`, color: kw.color }}>{kw.key}</span>
                    <p className="text-xs text-ark-text-muted leading-relaxed">{kw.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active enemies */}
            {enemies.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed rgba(217,107,107,0.25)" }}>
                <p className="text-ark-text-muted text-sm">No enemies in play.</p>
              </div>
            ) : enemies.map(enemy => {
              const engagedPlayer = players.find(p => p.id === enemy.engagedPlayerId);
              const hpPct = Math.min((enemy.currentDamage / enemy.health) * 100, 100);
              return (
                <div key={enemy.id} className="rounded-xl p-4" style={{ background: "rgba(26,16,10,0.8)", border: "1px solid rgba(217,107,107,0.25)" }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h4 className="font-decorative font-bold text-sm text-ark-text">{enemy.name}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {enemy.keywords.map(kw => {
                          const kwDef = ENEMY_KEYWORDS.find(k => k.key === kw);
                          return <span key={kw} className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: `${kwDef?.color ?? "#888"}18`, border: `1px solid ${kwDef?.color ?? "#888"}40`, color: kwDef?.color ?? "#888" }}>{kw}</span>;
                        })}
                      </div>
                    </div>
                    <button onClick={() => handleDefeatEnemy(enemy.id)} className="text-[10px] font-decorative font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0" style={{ background: "rgba(58,158,107,0.1)", border: "1px solid rgba(58,158,107,0.3)", color: "#5bbf8a" }}>Defeat</button>
                  </div>
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {[
                      { label: "Fight", val: enemy.fightVal, color: "#d96b6b" },
                      { label: "Evade", val: enemy.evadeVal, color: "#e8a84a" },
                      { label: "DMG",   val: enemy.damage,   color: "#d96b6b" },
                      { label: "HOR",   val: enemy.horror,   color: "#a888e8" },
                      { label: "HP",    val: `${enemy.currentDamage}/${enemy.health}`, color: "#5bbf8a" },
                    ].map(s => (
                      <div key={s.label} className="text-center py-2 rounded" style={{ background: "rgba(10,8,5,0.4)" }}>
                        <div className="text-[9px] font-mono text-ark-text-muted">{s.label}</div>
                        <div className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "rgba(58,158,107,0.12)" }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${hpPct}%`, background: hpPct > 66 ? "linear-gradient(90deg, #2a7048, #5bbf8a)" : hpPct > 33 ? "linear-gradient(90deg, #8a6010, #d4922a)" : "linear-gradient(90deg, #8e1a0e, #c05050)" }} />
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex gap-1">
                      <button onClick={() => handleEnemyDamage(enemy.id, -1)} className="w-6 h-6 rounded text-xs font-bold" style={{ background: "rgba(58,158,107,0.1)", color: "#5bbf8a", border: "1px solid rgba(58,158,107,0.2)" }}>−</button>
                      <span className="text-[10px] text-ark-text-muted px-1 self-center">dmg</span>
                      <button onClick={() => handleEnemyDamage(enemy.id, 1)} className="w-6 h-6 rounded text-xs font-bold" style={{ background: "rgba(217,107,107,0.1)", color: "#d96b6b", border: "1px solid rgba(217,107,107,0.2)" }}>+</button>
                    </div>
                    {players.length > 0 && (
                      <select value={enemy.engagedPlayerId} onChange={e => setEnemies(prev => prev.map(en => en.id === enemy.id ? { ...en, engagedPlayerId: e.target.value } : en))}
                        className="ark-input px-2 py-1 rounded text-xs flex-1 min-w-0 max-w-48">
                        <option value="">-- unengaged --</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.player_name}</option>)}
                      </select>
                    )}
                    <span className="text-[10px] text-ark-text-muted">Engaged: <span className="font-semibold text-ark-text">{engagedPlayer?.player_name ?? "none"}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* ── LOG TAB ───────────────────────────── */}
        {activeTab === "log" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-ark-text-muted font-mono">{actionLog.length} action{actionLog.length !== 1 ? "s" : ""} logged</p>
              {actionLog.length > 0 && isLead && (
                <button onClick={() => { setActionLog([]); if (session) appendActionLog(session.id, [], { id: "clear", playerName: "", investigator: "", action: "Log Cleared", detail: "", timestamp: new Date().toISOString(), round: turnState.round, actionNum: 0, phase: turnState.phase }); }}
                  className="text-xs text-ark-text-muted hover:text-ark-text transition-colors">Clear log</button>
              )}
            </div>
            {actionLog.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: "rgba(26,20,16,0.5)", border: "1px dashed #3d3020" }}>
                <p className="text-ark-text-muted text-sm">No actions logged yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {actionLog.map(entry => {
                  const actionDef = ACTIONS.find(a => a.label === entry.action);
                  const phaseInfo = PHASES.find(p => p.id === entry.phase);
                  return (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl group" style={{ background: "rgba(26,20,16,0.7)", border: "1px solid #2e2318" }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: actionDef ? actionDef.bg : "rgba(61,48,32,0.4)", border: `1px solid ${actionDef?.color ?? "#3d3020"}30` }}>
                        {actionDef?.skill ? <SkillIcon skill={actionDef.skill} size={16} /> : <ActionSymbol size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-decorative font-bold text-sm text-ark-text">{entry.playerName}</span>
                          <span className="text-ark-text-muted text-xs">·</span>
                          <span className="text-xs font-semibold" style={{ color: actionDef?.color ?? "#c9973a" }}>{entry.action}</span>
                          <span className="text-ark-text-muted text-xs ml-auto text-right">
                            R{entry.round}
                            {phaseInfo && <span style={{ color: phaseInfo.color }}> · {phaseInfo.label[0]}</span>}
                          </span>
                        </div>
                        <p className="text-ark-text-muted text-xs mt-0.5 leading-relaxed">{entry.detail}</p>
                      </div>
                      <button onClick={() => handleDeleteLogEntry(entry.id)}
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                        style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#d96b6b" }}
                        title="Delete this entry">
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* ── REFERENCE TAB ────────────────────── */}
        {activeTab === "reference" && (
          <div className="space-y-5">

            {/* Round structure */}
            <div className="rounded-xl p-4" style={{ background: "rgba(26,20,16,0.6)", border: "1px solid #3d3020" }}>
              <h3 className="font-decorative font-bold text-sm text-ark-text mb-3">Round Structure</h3>
              <div className="flex items-center gap-2 flex-wrap">
                {PHASES.map((phase, i) => (
                  <div key={phase.id} className="flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold" style={{ background: `${phase.color}12`, border: `1px solid ${phase.color}30`, color: phase.color }}>{i+1}. {phase.label}</span>
                      <p className="text-[9px] text-ark-text-muted max-w-24 text-center leading-tight">{phase.desc.split(",")[0]}</p>
                    </div>
                    {i < 3 && <span className="text-ark-text-muted text-sm">→</span>}
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-ark-text-muted mt-3">⚡ Round 1 skips the Mythos Phase entirely.</p>
            </div>

            {/* Skill icons legend */}
            <div className="rounded-xl p-4" style={{ background: "rgba(26,20,16,0.6)", border: "1px solid #3d3020" }}>
              <h3 className="font-decorative font-bold text-sm text-ark-text mb-3">Skill Icons</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { skill: "WIL", label: "Willpower", color: "#a888e8", desc: "Treacheries, Parley, horror" },
                  { skill: "INT", label: "Intellect",  color: "#6aabf7", desc: "Investigate, clue tests" },
                  { skill: "COM", label: "Combat",     color: "#d96b6b", desc: "Fight tests, enemies" },
                  { skill: "AGI", label: "Agility",    color: "#5bbf8a", desc: "Evade tests, movement" },
                ].map(s => (
                  <div key={s.skill} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                    <SkillIcon skill={s.skill} size={20} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
                      <p className="text-[9px] text-ark-text-muted">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Token legend */}
            <div className="rounded-xl p-4" style={{ background: "rgba(26,20,16,0.6)", border: "1px solid #3d3020" }}>
              <h3 className="font-decorative font-bold text-sm text-ark-text mb-3">Token Types</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: () => <DoomIcon size={20} />, label: "Doom", color: "#a888e8", desc: "Counts toward Agenda threshold" },
                  { Icon: () => <ClueIcon size={20} />, label: "Clue", color: "#6aabf7", desc: "Spend to advance Act deck" },
                  { Icon: () => <ResourceIcon size={20} />, label: "Resource", color: "#c9973a", desc: "Currency to play cards" },
                ].map(t => (
                  <div key={t.label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg text-center" style={{ background: `${t.color}08`, border: `1px solid ${t.color}20` }}>
                    <t.Icon />
                    <p className="text-xs font-bold" style={{ color: t.color }}>{t.label}</p>
                    <p className="text-[9px] text-ark-text-muted leading-tight">{t.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chaos bag */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3d3020" }}>
              <div className="px-4 py-3" style={{ background: "rgba(26,20,16,0.6)", borderBottom: "1px solid #3d3020" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">{turnState.campaignId && CAMPAIGNS.find(c => c.id === turnState.campaignId)?.name ? CAMPAIGNS.find(c => c.id === turnState.campaignId)!.name : "Standard"} Chaos Bag</h3>
                <p className="text-xs text-ark-text-muted">Standard difficulty</p>
              </div>
              <div className="p-4 flex flex-wrap gap-2" style={{ background: "rgba(10,8,5,0.5)" }}>
                {CHAOS_TOKENS.map((t, i) => (
                  <span key={i} className="px-2 py-1 rounded font-mono font-bold text-xs" style={{ background: `${t.color}15`, border: `1px solid ${t.color}40`, color: t.color }}>{t.token}</span>
                ))}
              </div>
            </div>

            {/* Easily missed rules */}
            <div>
              <h3 className="font-decorative font-bold text-sm text-ark-text mb-3">Easily Missed Rules</h3>
              <div className="space-y-2">
                {MISSED_RULES.map((r, i) => (
                  <div key={i} className="px-4 py-3 rounded-xl" style={{ background: "rgba(232,168,74,0.05)", border: "1px solid rgba(232,168,74,0.2)" }}>
                    <p className="font-bold text-xs mb-1" style={{ color: "#e8a84a" }}>{r.title}</p>
                    <p className="text-xs text-ark-text-muted leading-relaxed">{r.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          60% { opacity: 0.7; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
