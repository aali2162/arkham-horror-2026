"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import BackButton from "@/components/learn/BackButton";
import {
  getSessionByCode, getPlayers, subscribeToPlayers, subscribeToSession,
  addPlayer, removePlayer, updatePlayerStat, updateTurnState, appendActionLog, updateActionLog,
} from "@/lib/session";
import { GameSession, GamePlayer, TurnState, ActionLogEntry, EnemyState } from "@/types";
import { investigators } from "@/data/investigators";
import { actions as ACTION_DATA } from "@/data/actions";
import { searchCards, getEnemyPreset, CardEntry } from "@/data/cards";

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

// ─── Class colours — matched exactly to rulebook quick-reference ─────────────
const CLASS_COLORS: Record<string, { hex: string; bg: string; border: string; glow: string }> = {
  Guardian: { hex: "#4a8fd4", bg: "rgba(74,143,212,0.10)",  border: "rgba(74,143,212,0.45)",  glow: "rgba(74,143,212,0.22)"  },
  Seeker:   { hex: "#c8871a", bg: "rgba(200,135,26,0.10)",  border: "rgba(200,135,26,0.45)",  glow: "rgba(200,135,26,0.22)"  },
  Rogue:    { hex: "#2e8a50", bg: "rgba(46,138,80,0.10)",   border: "rgba(46,138,80,0.45)",   glow: "rgba(46,138,80,0.22)"   },
  Mystic:   { hex: "#7050b8", bg: "rgba(112,80,184,0.10)",  border: "rgba(112,80,184,0.45)",  glow: "rgba(112,80,184,0.22)"  },
  Survivor: { hex: "#b82020", bg: "rgba(184,32,32,0.10)",   border: "rgba(184,32,32,0.45)",   glow: "rgba(184,32,32,0.22)"   },
};

// ─── Arkham actions — colours matched to rulebook class/skill palette ─────────
const ACTIONS = [
  { id: "investigate", label: "Investigate", color: "#c8871a", bg: "rgba(200,135,26,0.08)", desc: "Test Intellect vs. location shroud to collect a clue", skill: "INT" },
  { id: "move",        label: "Move",        color: "#3aad98", bg: "rgba(58,173,152,0.08)", desc: "Move to a connecting location", skill: null },
  { id: "fight",       label: "Fight",       color: "#c03028", bg: "rgba(192,48,40,0.08)",  desc: "Test Combat vs. enemy Fight value — deal damage on success", skill: "COM" },
  { id: "evade",       label: "Evade",       color: "#2e8a50", bg: "rgba(46,138,80,0.08)",  desc: "Test Agility vs. enemy Evade value — exhaust the enemy", skill: "AGI" },
  { id: "engage",      label: "Engage",      color: "#c03028", bg: "rgba(192,48,40,0.08)",  desc: "Engage an unengaged enemy at your location", skill: null },
  { id: "parley",      label: "Parley",      color: "#9070d8", bg: "rgba(144,112,216,0.08)",desc: "Negotiate with an enemy — requires card text to allow it", skill: "WIL" },
  { id: "draw",        label: "Draw",        color: "#9070d8", bg: "rgba(144,112,216,0.08)",desc: "Draw 1 card from your deck", skill: null },
  { id: "resource",    label: "Resource",    color: "#c9973a", bg: "rgba(201,151,58,0.08)", desc: "Gain 1 resource token from the supply", skill: null },
  { id: "play",        label: "Play Card",   color: "#4a8fd4", bg: "rgba(74,143,212,0.08)", desc: "Pay cost and play an Asset or Event from hand", skill: null },
  { id: "activate",    label: "Activate",    color: "#3aad98", bg: "rgba(58,173,152,0.08)", desc: "Use a [→] ability on a card you control", skill: null },
  { id: "resign",      label: "Resign",      color: "#8a7860", bg: "rgba(138,120,96,0.08)", desc: "Leave the scenario safely at a resign location", skill: null },
] as const;
type ActionId = typeof ACTIONS[number]["id"];

// ─── Phase config — colours matched to rulebook phase-card borders ────────────
const PHASES: { id: TurnState["phase"]; label: string; color: string; desc: string }[] = [
  { id: "mythos",        label: "Mythos",        color: "#9070d8", desc: "Place doom, check threshold, draw encounter cards" },
  { id: "investigation", label: "Investigation",  color: "#c8871a", desc: "Each investigator takes 3 actions" },
  { id: "enemy",         label: "Enemy",          color: "#c03028", desc: "Hunter enemies move, then all engaged enemies attack" },
  { id: "upkeep",        label: "Upkeep",         color: "#3aad98", desc: "Ready all exhausted cards, draw 1 card, gain 1 resource" },
];

// ─── Enemy keyword guide — colours match rulebook keyword badge style ─────────
const ENEMY_KEYWORDS = [
  { key: "Hunter",    color: "#c03028", desc: "Moves toward nearest investigator each Enemy Phase" },
  { key: "Alert",     color: "#c8871a", desc: "Attacks if you fail evasion" },
  { key: "Retaliate", color: "#c03028", desc: "Attacks if you fail a Fight test against it" },
  { key: "Aloof",     color: "#9070d8", desc: "Won't auto-engage — must use Engage action" },
  { key: "Elusive",   color: "#3aad98", desc: "Flees after being attacked" },
  { key: "Massive",   color: "#c8871a", desc: "Engages ALL investigators at its location" },
  { key: "Patrol",    color: "#4a8fd4", desc: "Moves between designated locations each phase" },
  { key: "Doomed",    color: "#9070d8", desc: "When defeated, place 1 doom on current agenda" },
];

// ─── SVG Rulebook Symbols — matched exactly to the quick-reference page ──────

// Action cost symbol: double-chevron arrow (►► in rulebook)
function ActionSymbol({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 7l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 7l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Willpower: raised fist — solid silhouette matching rulebook
function WillpowerIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      {/* Fist silhouette */}
      <path d="M7 10V6.5a1 1 0 012 0V10h.5V5.5a1 1 0 012 0V10h.5V6.5a1 1 0 012 0V11.5c0 2.5-1.5 5-4 5.5H8c-2 0-3-1.5-3-3V12a1 1 0 011-1h1v-1z" fillOpacity="0.85"/>
    </svg>
  );
}

// Intellect: open book — two pages spread
function IntellectIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 5C8 3.5 4 3.5 2 5v10c2-1.5 6-1.5 8 0V5z" fill={color} fillOpacity="0.7" stroke={color} strokeWidth="0.8"/>
      <path d="M10 5c2-1.5 6-1.5 8 0v10c-2-1.5-6-1.5-8 0V5z" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="0.8"/>
      <line x1="10" y1="5" x2="10" y2="15" stroke={color} strokeWidth="1" strokeOpacity="0.6"/>
    </svg>
  );
}

// Combat: clenched fist with knuckle lines — matches rulebook fist icon
function CombatIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <path d="M5 9.5V8a1.5 1.5 0 013 0v1.5h.4V7a1.5 1.5 0 013 0v2.5h.4V8a1.5 1.5 0 013 0v2.5c0 1-.3 2-.8 2.8L13 15H7l-1-1.5C5.4 12.6 5 11.5 5 10.5V9.5z" fillOpacity="0.85"/>
      <rect x="5" y="15" width="10" height="2.5" rx="1.2" fillOpacity="0.7"/>
    </svg>
  );
}

// Agility: running figure leaning forward — matches rulebook
function AgilityIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <circle cx="13.5" cy="3.5" r="2" fillOpacity="0.9"/>
      {/* Body leaning forward */}
      <path d="M12 6l-3 3.5 1.5 1L8 14h2l2-3 1.5 1L16 9l-2-1.5" fillOpacity="0.85"/>
      {/* Back leg */}
      <path d="M9 9.5L6.5 12l1 1L10 11" fillOpacity="0.7"/>
      {/* Speed lines */}
      <line x1="3" y1="8" x2="7" y2="8" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round"/>
      <line x1="2" y1="11" x2="6" y2="11" stroke={color} strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round"/>
    </svg>
  );
}

// Wild: question mark in a circle — matches rulebook "?" wild symbol
function WildIcon({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5"/>
      <text x="10" y="14.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill={color} fontFamily="serif">?</text>
    </svg>
  );
}

// Doom token: black circle with skull/clock — dark ominous circle
function DoomIcon({ size = 16, color = "#9070d8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8.5" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.5"/>
      {/* Skull eye sockets */}
      <circle cx="7.5" cy="9"  r="1.5" fill={color} fillOpacity="0.7"/>
      <circle cx="12.5" cy="9" r="1.5" fill={color} fillOpacity="0.7"/>
      {/* Jaw line */}
      <path d="M7 12.5 Q10 14.5 13 12.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* Tooth gaps */}
      <line x1="10" y1="12.5" x2="10" y2="14" stroke={color} strokeWidth="1" strokeOpacity="0.5"/>
    </svg>
  );
}

// Clue token: teal circle with concentric rings — matches physical token
function ClueIcon({ size = 16, color = "#3aad98" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8"   fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="5"   fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1"/>
      <circle cx="10" cy="10" r="2.2" fill={color} fillOpacity="0.7"/>
    </svg>
  );
}

// Resource token: hexagonal wooden cube — matches physical token
function ResourceIcon({ size = 16, color = "#c9973a" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {/* Hexagon */}
      <path d="M10 2L17.3 6v8L10 18 2.7 14V6z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.4"/>
      {/* Inner cube lines suggesting 3D */}
      <path d="M10 2v6M10 8l7.3-2M10 8l-7.3-2" stroke={color} strokeWidth="0.9" strokeOpacity="0.5"/>
    </svg>
  );
}

// Damage token: red hexagon with heart — matches physical token
function DamageIcon({ size = 16, color = "#c03028" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2L17.3 6v8L10 18 2.7 14V6z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.4"/>
      <path d="M10 14s-5-3.5-5-7a3 3 0 016 0 3 3 0 016 0c0 3.5-5 7-7 7z" fill={color} fillOpacity="0.7" transform="scale(0.6) translate(6.7,5)"/>
    </svg>
  );
}

// Horror token: blue hexagon with brain — matches physical token
function HorrorIcon({ size = 16, color = "#3868a8" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M10 2L17.3 6v8L10 18 2.7 14V6z" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.4"/>
      {/* Brain lobes */}
      <path d="M7 11.5 Q6 9 8 8.5 Q9 7 10 8 Q11 7 12 8.5 Q14 9 13 11.5 Q12 13 10 13 Q8 13 7 11.5z" fill={color} fillOpacity="0.6"/>
      <line x1="10" y1="8" x2="10" y2="13" stroke={color} strokeWidth="0.7" strokeOpacity="0.4"/>
    </svg>
  );
}

function SkillIcon({ skill, size = 14 }: { skill: string; size?: number }) {
  // Skill colours matched exactly to rulebook quick-reference
  const colorMap: Record<string, string> = {
    WIL:  "#9070d8",  // Willpower — purple (Mystic-adjacent)
    INT:  "#c8871a",  // Intellect — amber (Seeker-adjacent)
    COM:  "#c03028",  // Combat    — red
    AGI:  "#2e8a50",  // Agility   — green (Rogue-adjacent)
    WILD: "#c9973a",  // Wild      — gold
  };
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

// Colours matched to actual physical token colours in the rulebook photo
const CHAOS_TOKENS = [
  { token: "+1",          color: "#3aad98" },  // teal — positive
  { token: "0",           color: "#9a9080" },  { token: "0",  color: "#9a9080" },
  { token: "−1",          color: "#c8871a" },  { token: "−1", color: "#c8871a" },
  { token: "−1",          color: "#c8871a" },  { token: "−1", color: "#c8871a" },
  { token: "−2",          color: "#b86020" },  { token: "−2", color: "#b86020" },
  { token: "−3",          color: "#a83820" },  { token: "−4", color: "#902010" },
  { token: "Skull",       color: "#706050" },   // dark brown — scenario symbol
  { token: "Cultist",     color: "#606850" },
  { token: "Tablet",      color: "#507060" },
  { token: "Elder Thing", color: "#505870" },
  { token: "Elder Sign",  color: "#3aad98" },  // teal — investigator ability
  { token: "Auto-fail",   color: "#b82020" },  // red — skull/tentacle
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

  // Who am I? — identified by player UUID stored per-session in localStorage
  // Key: ark_player_id_{sessionCode} → player.id (UUID)
  // Falls back to old ark_player_name for backwards compat with existing sessions
  const [myPlayerId, setMyPlayerId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const code = (window.location.pathname.split("/").pop() ?? "").toUpperCase();
      return localStorage.getItem(`ark_player_id_${code}`) ?? "";
    }
    return "";
  });
  // Is this the device that created the session? (set in play/page.tsx on Create)
  const isCreator = typeof window !== "undefined"
    ? localStorage.getItem(`ark_creator_${sessionCode}`) === "1"
    : false;
  // Legacy name-based identity (kept for backwards compat + name picker modal)
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
  // Shroud quick-pick for Investigate action
  const [selectedShroud, setSelectedShroud] = useState<number | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"board" | "enemies" | "log" | "reference">("board");

  // Enemies — synced via TurnState (Supabase real-time to all devices)
  const enemies: EnemyState[] = turnState.enemies ?? [];
  const [showAddEnemy, setShowAddEnemy] = useState(false);
  const [newEnemy, setNewEnemy] = useState({ name: "", fightVal: 3, evadeVal: 3, health: 3, damage: 1, horror: 1, keywords: [] as string[], engagedPlayerIds: [] as string[], massive: false });
  const [cardSearch, setCardSearch] = useState("");
  const [cardResults, setCardResults] = useState<CardEntry[]>([]);
  const [showCardDropdown, setShowCardDropdown] = useState(false);
  // Scenario end flow
  const [showEndScenario, setShowEndScenario] = useState(false);
  const [scenarioResolutionText, setScenarioResolutionText] = useState("");
  const [showScenarioSummary, setShowScenarioSummary] = useState(false);
  const [showCarryOverModal, setShowCarryOverModal] = useState(false);

  // Phase transition animation
  const [phaseFlash, setPhaseFlash] = useState(false);

  // Player reorder mode
  const [reorderMode, setReorderMode] = useState(false);

  // View board while it's your turn
  const [viewBoardMode, setViewBoardMode] = useState(false);

  // Campaign picker modal
  const [showCampaignPicker, setShowCampaignPicker] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  // Custom / Freeform campaign free-text fields
  const [customCampaignName, setCustomCampaignName] = useState("");
  const [customScenarioName, setCustomScenarioName] = useState("");
  const [customAgendaName, setCustomAgendaName] = useState("");
  const [customActName, setCustomActName] = useState("");
  const [customDoomThreshold, setCustomDoomThreshold] = useState(4);
  const [customCluesRequired, setCustomCluesRequired] = useState(2);

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

  // Auto-rejoin: if we have a saved player UUID that still exists, silently re-claim them
  useEffect(() => {
    if (!loading && myPlayerId && players.length > 0) {
      const matched = players.find(p => p.id === myPlayerId);
      if (matched && matched.player_name !== myPlayerName) {
        setMyPlayerName(matched.player_name);
      }
    }
  }, [loading, myPlayerId, players]);

  // Identity onboarding:
  // - Creator: auto-claimed in handleStartGame (no picker needed)
  // - Non-creator: show picker when game starts and they have no identity yet
  // - Legacy/fallback: show picker if they have no identity at all
  useEffect(() => {
    if (loading) return;
    if (isCreator) return;  // creator auto-claims in handleStartGame
    if (myPlayerId || myPlayerName) return;  // already identified
    if (players.length === 0) return;
    // Show picker when game has started (transition moment) OR if already in-game
    if (turnState.gameStarted) {
      setShowNamePicker(true);
    }
  }, [loading, isCreator, myPlayerId, myPlayerName, players.length, turnState.gameStarted]);

  // ── Derived values ────────────────────────────────────────
  const currentPlayer = players[turnState.currentPlayerIdx] ?? null;
  const leadPlayer = players[turnState.leadInvestigatorIdx] ?? null;
  const myPlayer = players.find(p => p.id === myPlayerId)
    ?? players.find(p => p.player_name === myPlayerName)
    ?? null;
  const isMyTurn = myPlayer && currentPlayer && myPlayer.id === currentPlayer.id;
  const isLead = myPlayer && leadPlayer && myPlayer.id === leadPlayer.id;

  // YOUR TURN auto-takeover: snap to full-screen takeover whenever this device's turn starts
  useEffect(() => {
    if (isMyTurn && turnState.phase === "investigation") {
      setViewBoardMode(false);
      setSelectedAction(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMyTurn, turnState.phase]);

  // Scenario ended: show summary on all devices when lead ends scenario
  useEffect(() => {
    if (turnState.scenarioEnded && !showScenarioSummary) {
      setShowScenarioSummary(true);
    }
  }, [turnState.scenarioEnded]);
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
    setSelectedShroud(null);
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
    // Reset clues on act when advancing
    const next = { ...ts, scenarioNumber: nextScenarioNumber, cluesOnAct: 0 };
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
      cluesOnAct: 0,
      round: 1,
      phase: "investigation",
      currentPlayerIdx: 0,
      actionsUsed: 0,
      enemies: [],             // clear all enemies between scenarios
      scenarioEnded: false,
      scenarioResolution: "",
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

  const handleSelectCustomScenario = async () => {
    if (!customScenarioName.trim()) return;
    const next = {
      ...turnState,
      agendaName: customAgendaName.trim() || customScenarioName.trim(),
      actName: customActName.trim() || "Act 1",
      doomThreshold: customDoomThreshold,
      cluesRequired: customCluesRequired,
      scenarioNumber: 1,
      campaignId: "custom",
      scenarioId: `custom-${Date.now()}`,
    };
    await pushTurnState(next);
    setShowCampaignPicker(false);
    setSelectedCampaignId(null);
    setCustomCampaignName("");
    setCustomScenarioName("");
    setCustomAgendaName("");
    setCustomActName("");
    setCustomDoomThreshold(4);
    setCustomCluesRequired(2);
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
    // Auto-claim the creator as the first player in the ordered list
    // The creator set up the lobby and added themselves first
    if (isCreator && !myPlayerId) {
      const firstPlayer = players.find(p => p.id === orderedIds[0]) ?? players[0];
      if (firstPlayer) claimPlayer(firstPlayer);
    }
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

  // ── Enemy helpers (all synced to Supabase via pushTurnState) ─────────────────
  const handleAddEnemy = async () => {
    if (!newEnemy.name.trim()) return;
    const spawned: EnemyState = {
      id: `e-${Date.now()}`,
      name: newEnemy.name.trim(),
      fightVal: newEnemy.fightVal,
      evadeVal: newEnemy.evadeVal,
      health: newEnemy.health,
      damage: newEnemy.damage,
      horror: newEnemy.horror,
      currentDamage: 0,
      keywords: newEnemy.keywords,
      engagedPlayerIds: newEnemy.engagedPlayerIds,
      exhausted: false,
    };
    const ts = turnStateRef.current;
    await pushTurnState({ ...ts, enemies: [...(ts.enemies ?? []), spawned] });
    await pushLog({
      id: `spawn-${Date.now()}`,
      playerName: leadPlayer?.player_name ?? "",
      investigator: leadPlayer?.investigator ?? "",
      action: "Enemy Spawned",
      detail: `${spawned.name} appeared${spawned.engagedPlayerIds.length ? ` — engaged with ${spawned.engagedPlayerIds.map(id => players.find(p => p.id === id)?.player_name ?? id).join(", ")}` : " — unengaged"}`,
      timestamp: new Date().toISOString(),
      round: ts.round, actionNum: 0, phase: ts.phase,
    });
    setNewEnemy({ name: "", fightVal: 3, evadeVal: 3, health: 3, damage: 1, horror: 1, keywords: [], engagedPlayerIds: [], massive: false });
    setShowAddEnemy(false);
  };

  const handleEnemyDamage = async (id: string, delta: number) => {
    const ts = turnStateRef.current;
    const next = (ts.enemies ?? []).map(e => e.id !== id ? e : { ...e, currentDamage: Math.max(0, e.currentDamage + delta) });
    await pushTurnState({ ...ts, enemies: next });
  };

  const handleToggleExhaust = async (id: string) => {
    const ts = turnStateRef.current;
    const next = (ts.enemies ?? []).map(e => e.id !== id ? e : { ...e, exhausted: !e.exhausted });
    await pushTurnState({ ...ts, enemies: next });
  };

  const handleEnemyEngage = async (enemyId: string, playerId: string) => {
    const ts = turnStateRef.current;
    const enemy = (ts.enemies ?? []).find(e => e.id === enemyId);
    if (!enemy) return;
    const isMassive = enemy.keywords.includes("Massive");
    let newEngaged: string[];
    if (isMassive) {
      newEngaged = enemy.engagedPlayerIds.includes(playerId)
        ? enemy.engagedPlayerIds.filter(id => id !== playerId)
        : [...enemy.engagedPlayerIds, playerId];
    } else {
      newEngaged = enemy.engagedPlayerIds[0] === playerId ? [] : [playerId];
    }
    const next = (ts.enemies ?? []).map(e => e.id !== enemyId ? e : { ...e, engagedPlayerIds: newEngaged });
    const pName = players.find(p => p.id === playerId)?.player_name ?? playerId;
    await pushTurnState({ ...ts, enemies: next });
    await pushLog({
      id: `engage-${Date.now()}`,
      playerName: pName,
      investigator: players.find(p => p.id === playerId)?.investigator ?? "",
      action: newEngaged.includes(playerId) ? "Engaged Enemy" : "Disengaged",
      detail: `${newEngaged.includes(playerId) ? "Engaged with" : "Disengaged from"} ${enemy.name}`,
      timestamp: new Date().toISOString(),
      round: ts.round, actionNum: 0, phase: ts.phase,
    });
  };

  const handleEnemyAttack = async (enemy: EnemyState) => {
    const ts = turnStateRef.current;
    const targetPlayers = enemy.engagedPlayerIds
      .map(id => players.find(p => p.id === id))
      .filter(Boolean) as typeof players;
    if (targetPlayers.length === 0) return;

    // Apply damage + horror to every engaged investigator
    await Promise.all(targetPlayers.map(p => Promise.all([
      updatePlayerStat(p.id, "damage", p.damage + enemy.damage),
      updatePlayerStat(p.id, "horror", p.horror + enemy.horror),
    ])));

    const targetNames = targetPlayers.map(p => p.player_name).join(", ");
    await pushLog({
      id: `attack-${Date.now()}`,
      playerName: enemy.name,
      investigator: "",
      action: "Enemy Attack",
      detail: `${enemy.name} attacked ${targetNames} — dealt ${enemy.damage} damage + ${enemy.horror} horror to each`,
      timestamp: new Date().toISOString(),
      round: ts.round, actionNum: 0, phase: ts.phase,
    });
  };

  const handleDefeatEnemy = async (id: string) => {
    const ts = turnStateRef.current;
    const e = (ts.enemies ?? []).find(x => x.id === id);
    if (!e) return;
    const nextDoom = e.keywords.includes("Doomed") ? ts.doom + 1 : ts.doom;
    const next = (ts.enemies ?? []).filter(x => x.id !== id);
    await pushTurnState({ ...ts, enemies: next, doom: nextDoom });
    await pushLog({
      id: `defeat-${Date.now()}`,
      playerName: leadPlayer?.player_name ?? "",
      investigator: leadPlayer?.investigator ?? "",
      action: "Enemy Defeated",
      detail: `${e.name} defeated${e.keywords.includes("Doomed") ? " — placed 1 doom (Doomed keyword)" : ""}`,
      timestamp: new Date().toISOString(),
      round: ts.round, actionNum: 0, phase: ts.phase,
    });
  };

  const toggleEnemyKeyword = (k: string) => setNewEnemy(prev => ({
    ...prev, keywords: prev.keywords.includes(k) ? prev.keywords.filter(x => x !== k) : [...prev.keywords, k],
  }));

  const handleReadyAllEnemies = async () => {
    const ts = turnStateRef.current;
    if (!(ts.enemies ?? []).some(e => e.exhausted)) return;
    const next = (ts.enemies ?? []).map(e => ({ ...e, exhausted: false }));
    await pushTurnState({ ...ts, enemies: next });
    await pushLog({
      id: `ready-${Date.now()}`,
      playerName: leadPlayer?.player_name ?? "",
      investigator: leadPlayer?.investigator ?? "",
      action: "Enemies Readied",
      detail: "All exhausted enemies are now ready",
      timestamp: new Date().toISOString(),
      round: ts.round, actionNum: 0, phase: ts.phase,
    });
  };

  // ── Scenario end helpers ──────────────────────────────────
  const handleEndScenario = async () => {
    const ts = turnStateRef.current;
    await pushTurnState({ ...ts, scenarioEnded: true, scenarioResolution: scenarioResolutionText });
    await pushLog({
      id: `scenario-end-${Date.now()}`,
      playerName: leadPlayer?.player_name ?? "",
      investigator: leadPlayer?.investigator ?? "",
      action: "Scenario Ended",
      detail: scenarioResolutionText || "Scenario concluded",
      timestamp: new Date().toISOString(),
      round: ts.round, actionNum: 0, phase: ts.phase,
    });
    setShowEndScenario(false);
    setShowScenarioSummary(true);
  };

  // ── Name identification ───────────────────────────────────
  // Primary identity: bind this device to a specific player UUID (per-session)
  const claimPlayer = useCallback((player: GamePlayer) => {
    setMyPlayerId(player.id);
    setMyPlayerName(player.player_name);
    localStorage.setItem(`ark_player_id_${sessionCode}`, player.id);
    localStorage.setItem("ark_player_name", player.player_name);
    setShowNamePicker(false);
  }, [sessionCode]);

  // Legacy fallback — used by the name picker modal for backwards compat
  const handleSetName = (name: string) => {
    const p = players.find(x => x.player_name === name);
    if (p) { claimPlayer(p); return; }
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
        <div className="h-6 w-40 rounded mx-auto" style={{ background: "#e8d8a8" }} />
        <div className="h-4 w-60 rounded mx-auto" style={{ background: "#e8d8a8" }} />
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

    // ── Non-creator waiting room ──────────────────────────────
    if (!isCreator) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#f2e8cc" }}>
          <Navbar />
          <div className="max-w-sm w-full text-center mt-16">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest mb-6 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(201,151,58,0.08)", border: "1px solid rgba(201,151,58,0.25)", color: "#c9973a" }}>
              <span className="live-dot" /> LOBBY · {sessionCode}
            </div>
            <div className="text-5xl mb-4">⏳</div>
            <h1 className="font-decorative font-bold text-xl text-ark-text mb-2">Waiting for host…</h1>
            <p className="text-sm text-ark-text-muted mb-6">The session host is setting up the game. You'll be taken in automatically when they start.</p>

            {/* Show who's already in the lobby */}
            {players.length > 0 && (
              <div className="rounded-xl p-4 mb-6 text-left space-y-2"
                style={{ background: "rgba(236,220,176,0.9)", border: "1px solid #c8a860" }}>
                <p className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-3">In the lobby</p>
                {orderedLobbyPlayers.map((player) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <div key={player.id} className="flex items-center gap-2 py-1">
                      <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ background: cls.bg, color: cls.hex }}>{player.investigator[0]}</div>
                      <div>
                        <p className="font-decorative text-sm text-ark-text">{player.player_name}</p>
                        <p className="text-[10px]" style={{ color: cls.hex }}>{player.investigator}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs font-mono" style={{ color: "#5a4838" }}>Session code: <span style={{ color: "#c9973a" }}>{sessionCode}</span></p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f2e8cc" }}>
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
            style={{ background: "rgba(201,151,58,0.08)", border: "1px solid rgba(201,151,58,0.25)", color: copied ? "#3aad98" : "#c9973a" }}>
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
              <div className="rounded-xl p-6 text-center" style={{ background: "rgba(236,220,176,0.7)", border: "1px dashed #c8a860" }}>
                <p className="text-ark-text-muted text-sm">No investigators yet. Add the first one below.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orderedLobbyPlayers.map((player, idx) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <div key={player.id} className="flex items-center gap-3 rounded-xl p-3 transition-all"
                      style={{ background: "#ecdcb0", border: `1px solid ${cls.border}` }}>
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
                        style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#c03028" }}>
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
            <div className="mb-5 rounded-xl p-4" style={{ background: lobbyOrderConfirmed ? "rgba(58,173,152,0.06)" : "rgba(236,220,176,0.92)", border: `1px solid ${lobbyOrderConfirmed ? "rgba(58,173,152,0.4)" : "rgba(138,104,32,0.3)"}` }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0"
                  style={{ background: lobbyOrderConfirmed ? "rgba(58,173,152,0.3)" : "rgba(201,151,58,0.2)", border: `1px solid ${lobbyOrderConfirmed ? "rgba(58,173,152,0.6)" : "rgba(201,151,58,0.5)"}`, color: lobbyOrderConfirmed ? "#3aad98" : "#c9973a" }}>
                  {lobbyOrderConfirmed ? "✓" : "2"}
                </div>
                <h2 className="text-sm font-decorative font-bold text-ark-text">Set Turn Order</h2>
                {lobbyOrderConfirmed && <span className="text-xs font-mono" style={{ color: "#3aad98" }}>Confirmed</span>}
              </div>
              <div className="space-y-2 mb-3">
                {orderedLobbyPlayers.map((player, idx) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <div key={player.id} className="flex items-center gap-3 rounded-lg p-2.5"
                      style={{ background: "rgba(236,220,176,0.65)", border: `1px solid ${cls.border}50` }}>
                      <span className="font-mono font-bold text-sm w-5 text-center flex-shrink-0" style={{ color: "#c9973a" }}>{idx + 1}</span>
                      <div className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ background: cls.bg, color: cls.hex }}>{player.investigator[0]}</div>
                      <span className="flex-1 text-sm font-decorative text-ark-text truncate">{player.player_name}</span>
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => handleReorderPlayer(player.id, "up")}
                          disabled={orderedLobbyPlayers[0]?.id === player.id}
                          className="w-5 h-5 rounded text-[10px] flex items-center justify-center disabled:opacity-20"
                          style={{ background: "rgba(58,173,152,0.2)", color: "#3aad98" }}>↑</button>
                        <button onClick={() => handleReorderPlayer(player.id, "down")}
                          disabled={orderedLobbyPlayers[orderedLobbyPlayers.length - 1]?.id === player.id}
                          className="w-5 h-5 rounded text-[10px] flex items-center justify-center disabled:opacity-20"
                          style={{ background: "rgba(58,173,152,0.2)", color: "#3aad98" }}>↓</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setLobbyOrderConfirmed(true)}
                className="w-full py-2 rounded-lg text-sm font-bold font-decorative transition-all"
                style={{ background: lobbyOrderConfirmed ? "rgba(58,173,152,0.15)" : "rgba(58,173,152,0.2)", border: `1px solid rgba(58,173,152,0.5)`, color: "#3aad98" }}>
                {lobbyOrderConfirmed ? "✓ Turn Order Confirmed" : "Confirm Turn Order →"}
              </button>
            </div>
          )}

          {/* ── STEP 3: Lead Investigator ── */}
          {players.length >= 1 && (
            <div className="mb-5 rounded-xl p-4" style={{ background: lobbyLeadConfirmed ? "rgba(201,151,58,0.06)" : "rgba(236,220,176,0.92)", border: `1px solid ${lobbyLeadConfirmed ? "rgba(201,151,58,0.4)" : "rgba(138,104,32,0.3)"}` }}>
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
                      style={{ background: isSelected ? cls.bg : "rgba(236,220,176,0.65)", border: `1px solid ${isSelected ? cls.border : "rgba(138,104,32,0.3)"}` }}>
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
            <div className="rounded-xl p-4 mb-6 space-y-3" style={{ background: "rgba(236,220,176,0.9)", border: "1px solid rgba(201,151,58,0.2)" }}>
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
                      { label: "HP", val: selInv.health, color: "#c03028" },
                      { label: "SAN", val: selInv.sanity, color: "#9070d8" },
                      { label: "WIL", val: selInv.willpower, color: "#9070d8" },
                      { label: "INT", val: selInv.intellect, color: "#4a8fd4" },
                      { label: "COM", val: selInv.combat, color: "#c03028" },
                      { label: "AGI", val: selInv.agility, color: "#3aad98" },
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
                    background: ready ? "linear-gradient(135deg, #c9973a, #a07828)" : "rgba(200,168,96,0.25)",
                    color: ready ? "#2a1808" : "#8a6820",
                    border: "1px solid rgba(201,151,58,0.4)",
                    boxShadow: ready ? "0 0 32px rgba(201,151,58,0.25)" : "none"
                  }}>
                  {ready ? `▶ Start Game — ${players.length} Investigator${players.length !== 1 ? "s" : ""}` : "Start Game"}
                </button>
                {blockReason && (
                  <p className="text-center text-xs mt-2 font-mono" style={{ color: "#c03028" }}>⚠ {blockReason}</p>
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
      if (newP) claimPlayer(newP);
      setJoiningPlayer(false);
    };

    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#f2e8cc" }}>
        <Navbar />
        <main className="max-w-sm mx-auto px-4 py-10 w-full">
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest mb-4 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(58,173,152,0.08)", border: "1px solid rgba(58,173,152,0.25)", color: "#3aad98" }}>
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
                    <button key={p.id} onClick={() => claimPlayer(p)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left active:scale-98"
                      style={{ background: cls.bg, border: `1px solid ${cls.border}` }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{ background: "rgba(236,220,176,0.65)", color: cls.hex, border: `1px solid ${cls.border}` }}>
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
              <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(236,220,176,0.9)", border: "1px solid rgba(201,151,58,0.2)" }}>
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
                        { label: "HP", val: selInv.health, color: "#c03028" },
                        { label: "SAN", val: selInv.sanity, color: "#9070d8" },
                        { label: "WIL", val: selInv.willpower, color: "#9070d8" },
                        { label: "INT", val: selInv.intellect, color: "#4a8fd4" },
                        { label: "COM", val: selInv.combat, color: "#c03028" },
                        { label: "AGI", val: selInv.agility, color: "#3aad98" },
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
            <div className="rounded-xl p-4 text-center text-xs font-mono" style={{ background: "rgba(192,57,43,0.08)", border: "1px solid rgba(192,57,43,0.3)", color: "#c03028" }}>
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
      <div className="min-h-screen flex flex-col" style={{ background: "#f2e8cc" }}>
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
            style={{ background: `linear-gradient(145deg, ${cls.bg}, rgba(248,240,216,0.5))`, border: `2px solid ${cls.border}`, boxShadow: `0 0 40px ${cls.glow}` }}>
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
                    : { background: "rgba(236,220,176,0.8)", border: "1px solid #c8a860", color: "#3d3020" }}>
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
              style={{ background: "rgba(74,143,212,0.08)", border: "1px solid rgba(74,143,212,0.3)", color: "#4a8fd4" }}>
              🗺 Board
            </button>
            <button onClick={handleUndoLastAction}
              disabled={actionLog.length === 0 || actionLog.every(e => e.action === "Undo" || e.action === "Log Cleared")}
              className="px-4 py-3.5 rounded-xl font-decorative font-bold text-sm tracking-wide transition-all active:scale-98 disabled:opacity-30"
              style={{ background: "rgba(232,168,74,0.08)", border: "1px solid rgba(232,168,74,0.3)", color: "#c8871a" }}>
              ↩ Undo
            </button>
            <button onClick={handleEndTurn}
              className="flex-1 py-3.5 rounded-xl font-decorative font-bold text-sm tracking-wide transition-all active:scale-98"
              style={{ background: "linear-gradient(135deg, #c9973a, #a07828)", border: "1px solid rgba(201,151,58,0.5)", color: "#2a1808" }}>
              End Turn →
            </button>
          </div>

          {/* My stats peek */}
          {myPlayer && (
            <div className="w-full mt-4 rounded-xl p-4 grid grid-cols-4 gap-2" style={{ background: "rgba(236,220,176,0.8)", border: "1px solid rgba(138,104,32,0.2)" }}>
              {[
                { label: "DMG", val: myPlayer.damage, max: inv?.health ?? 9, color: "#c03028", field: "damage" as const },
                { label: "HOR", val: myPlayer.horror, max: inv?.sanity ?? 7, color: "#9070d8", field: "horror" as const },
                { label: "RES", val: myPlayer.resources, max: null, color: "#c9973a", field: "resources" as const },
                { label: "CLU", val: myPlayer.clues, max: null, color: "#4a8fd4", field: "clues" as const },
              ].map(s => (
                <div key={s.label} className="flex flex-col items-center gap-1 py-2 rounded-lg" style={{ background: "rgba(236,220,176,0.65)" }}>
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
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "#f2e8cc" }}>
        <div className="w-full max-w-sm rounded-2xl p-6 space-y-4"
          style={{ background: "#f0e8d0", border: `1px solid ${selectedAction.color}40`, boxShadow: `0 20px 60px rgba(90,58,8,0.2), 0 0 40px ${selectedAction.color}12` }}>
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
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(236,220,176,0.75)", border: "1px solid #c8a860" }}>
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

          {/* ── Enemy picker for Fight / Evade / Engage ── */}
          {(["fight","evade","engage"].includes(selectedAction.id)) && enemies.length > 0 && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted block mb-2">
                {selectedAction.id === "fight" ? "Which enemy are you fighting?" :
                 selectedAction.id === "evade" ? "Which enemy are you evading?" :
                 "Which enemy are you engaging?"}
              </label>
              <div className="space-y-1.5">
                {enemies.map(e => {
                  const isEngaged = e.engagedPlayerIds.includes(myPlayer?.id ?? "");
                  const isSelected = actionDetail.includes(e.name);
                  return (
                    <button key={e.id}
                      onClick={() => setActionDetail(`${e.name} (Fight ${e.fightVal} / Evade ${e.evadeVal})`)}
                      className="w-full text-left px-3 py-2 rounded-lg transition-all"
                      style={isSelected
                        ? { background: `${selectedAction.color}20`, border: `1px solid ${selectedAction.color}60`, color: selectedAction.color }
                        : { background: "rgba(236,220,176,0.75)", border: "1px solid #c8a860", color: "#c8b090" }}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-decorative font-bold text-sm">{e.name}</span>
                        <span className="text-[10px] font-mono text-ark-text-muted shrink-0">
                          ⚔{e.fightVal} 🏃{e.evadeVal} ❤{e.health - e.currentDamage}hp
                        </span>
                      </div>
                      {isEngaged && <span className="text-[9px]" style={{ color: "#3aad98" }}>⚔ Currently engaged with you</span>}
                      {e.exhausted && <span className="text-[9px]" style={{ color: "#4a8fd4" }}> · Exhausted</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── When no enemies but trying to engage/fight ── */}
          {(["fight","evade","engage"].includes(selectedAction.id)) && enemies.length === 0 && (
            <div className="px-3 py-2 rounded-lg text-xs text-ark-text-muted"
              style={{ background: "rgba(236,220,176,0.65)", border: "1px solid #c8a860" }}>
              No enemies in play — the lead investigator can spawn one in the Enemies tab.
            </div>
          )}

          {/* ── Shroud picker for Investigate ── */}
          {selectedAction.id === "investigate" && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted block mb-2">
                Location shroud (difficulty)
              </label>
              <div className="flex items-center gap-1.5">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => {
                    setSelectedShroud(n);
                    setActionDetail(`Shroud ${n} — testing Intellect`);
                  }}
                    className="flex-1 py-2 rounded-lg text-sm font-bold font-mono transition-all"
                    style={selectedShroud === n
                      ? { background: "rgba(74,143,212,0.25)", border: "2px solid #4a8fd4", color: "#4a8fd4", boxShadow: "0 0 8px rgba(74,143,212,0.3)" }
                      : { background: "rgba(236,220,176,0.75)", border: "1px solid #c8a860", color: "#8a7860" }}>
                    {n}
                  </button>
                ))}
              </div>
              {selectedShroud && (
                <p className="text-[10px] font-mono mt-1.5 text-center" style={{ color: selectedShroud <= 2 ? "#3aad98" : selectedShroud === 3 ? "#c8871a" : "#c03028" }}>
                  {selectedShroud <= 2 ? "Easy — low shroud" : selectedShroud === 3 ? "Moderate — be careful" : "Hard — high risk location"}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted block mb-2">
              {(["fight","evade","engage"].includes(selectedAction.id)) && enemies.length > 0
                ? "Outcome / notes (optional)"
                : "Add detail (optional)"}
            </label>
            <input value={actionDetail} onChange={e => setActionDetail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogAction()}
              placeholder={
                selectedAction.id === "fight" ? `e.g. "Hit for 2 damage — 1 HP left"` :
                selectedAction.id === "evade" ? `e.g. "Evaded — enemy exhausted"` :
                selectedAction.id === "engage" ? `e.g. "Engaged — drew AoO"` :
                selectedAction.id === "investigate" ? (selectedShroud ? `e.g. "Passed — collected a clue"` : `Tap a shroud above, then add outcome`) :
                `e.g. "Investigated Library — passed +2"`
              }
              className="ark-input w-full px-3 py-2.5 rounded-lg text-sm" />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setSelectedAction(null)} className="btn-ghost flex-1 py-2.5 text-sm rounded-lg">← Back</button>
            <button onClick={handleLogAction}
              className="flex-1 py-2.5 text-sm rounded-lg font-bold transition-all"
              style={{ background: `linear-gradient(135deg, ${selectedAction.color}cc, ${selectedAction.color}88)`, color: "#2a1808" }}>
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
                style={{ background: "#ecdcb0", border: `1px solid ${color}30`, maxHeight: "85vh" }}>
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
                    <div className="rounded-lg px-4 py-3" style={{ background: "rgba(58,173,152,0.07)", border: "1px solid rgba(58,173,152,0.25)" }}>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-1.5" style={{ color: "#3aad98" }}>Example</p>
                      <p className="text-xs text-ark-text leading-relaxed">{actionData.example.narrative}</p>
                    </div>
                  )}

                  {/* Edge cases */}
                  {actionData.edgeCases && actionData.edgeCases.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "#c8871a" }}>Common questions</p>
                      <div className="space-y-2">
                        {actionData.edgeCases.map((ec, i) => (
                          <div key={i} className="rounded-lg px-3 py-2.5" style={{ background: "rgba(232,168,74,0.06)", border: "1px solid rgba(232,168,74,0.2)" }}>
                            <p className="text-[11px] font-bold mb-1" style={{ color: "#c8871a" }}>{ec.question}</p>
                            <p className="text-xs text-ark-text-muted leading-relaxed">{ec.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* When to use */}
                  {actionData.whenToUse && actionData.whenToUse.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest mb-2" style={{ color: "#4a8fd4" }}>When to use this</p>
                      <ul className="space-y-1">
                        {actionData.whenToUse.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-ark-text-muted">
                            <span style={{ color: "#4a8fd4" }}>·</span>{tip}
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
                    style={{ background: `linear-gradient(135deg, ${color}cc, ${color}88)`, color: "#2a1808" }}>
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
              style={{ background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#2a1808" }}>
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
                  <button onClick={() => handleFixRound(parseInt(roundEditValue))} className="text-[10px] px-1.5 py-1 rounded font-bold" style={{ background: "rgba(58,173,152,0.2)", color: "#3aad98" }}>✓</button>
                  <button onClick={() => setShowRoundEdit(false)} className="text-[10px] px-1.5 py-1 rounded font-bold" style={{ background: "rgba(192,57,43,0.15)", color: "#c03028" }}>✕</button>
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
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(112,80,184,0.12)", border: "1px solid rgba(112,80,184,0.35)" }}>
                  <span className="font-mono font-bold text-xs" style={{ color: "#9070d8" }}>Act {turnState.scenarioNumber}</span>
                </div>
                <div className="h-8 w-px" style={{ background: "#3d3020" }} />
              </>
            )}
            {/* Doom */}
            <div className="flex items-center gap-1.5">
              <DoomIcon size={14} color={doomDanger ? "#c03028" : "#9070d8"} />
              <span className="font-mono font-bold text-base" style={{ color: doomDanger ? "#c03028" : "#9070d8" }}>
                {turnState.doom}<span className="text-sm font-normal text-ark-text-muted">/{turnState.doomThreshold}</span>
              </span>
              {doomDanger && <span className="text-[9px] font-mono px-1.5 py-0.5 rounded animate-pulse" style={{ background: "rgba(192,57,43,0.2)", border: "1px solid rgba(192,57,43,0.4)", color: "#c03028" }}>ADVANCE!</span>}
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
              <span style={{ color: "#3aad98" }}>Live</span>
            </div>
            <button onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", color: "#c9973a" }}>
              {copied ? "✓ Copied!" : "Share Link"}
            </button>
          </div>
        </div>

        {/* ── Identity picker modal — shown to non-creator devices on game start ── */}
        {showNamePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}>
            <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: "#f0e8d0", border: "1px solid rgba(201,151,58,0.4)", boxShadow: "0 24px 80px rgba(90,58,8,0.18)" }}>
              {/* Header */}
              <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(201,151,58,0.15)" }}>
                <div className="text-3xl mb-3">🕵️</div>
                <h3 className="font-decorative font-bold text-xl text-ark-text mb-1">Who are you?</h3>
                <p className="text-ark-text-muted text-sm leading-relaxed">The game has started. Tap your investigator so the app knows when it&apos;s your turn.</p>
              </div>
              {/* Player list */}
              <div className="px-4 py-4 space-y-2">
                {players.map(p => {
                  const inv = investigators.find(i => i.name === p.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  const alreadyClaimed = false; // future: could track claimed UUIDs
                  return (
                    <button key={p.id} onClick={() => claimPlayer(p)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left active:scale-[0.98]"
                      style={{ background: cls.bg, border: `1px solid ${cls.border}`, boxShadow: `0 0 0 0 ${cls.hex}` }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                        style={{ background: `${cls.hex}22`, border: `1px solid ${cls.border}`, color: cls.hex }}>
                        {p.investigator[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-decorative font-bold text-sm text-ark-text">{p.player_name}</p>
                        <p className="text-xs truncate" style={{ color: cls.hex }}>{p.investigator}</p>
                      </div>
                      <span className="text-xs font-mono shrink-0" style={{ color: cls.hex }}>→</span>
                    </button>
                  );
                })}
                {players.length === 0 && (
                  <p className="text-ark-text-muted text-sm text-center py-4">No investigators in this session yet.</p>
                )}
              </div>
              {/* Only show close if they somehow already have identity */}
              {(myPlayerId || myPlayerName) && (
                <div className="px-4 pb-4">
                  <button onClick={() => setShowNamePicker(false)} className="btn-ghost w-full py-2 text-sm rounded-lg">Close</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ DOOM & ACT STATUS BAR — always prominent ══ */}
        <div className="rounded-2xl mb-4 overflow-hidden" style={{ border: `2px solid ${doomDanger ? "rgba(192,57,43,0.5)" : "rgba(112,80,184,0.35)"}`, background: "rgba(236,220,176,0.98)", boxShadow: doomDanger ? "0 0 24px rgba(192,57,43,0.15)" : "0 0 16px rgba(112,80,184,0.08)" }}>

          {/* ── Orrery session header ── */}
          <div className="flex flex-col items-center pt-4 pb-3 px-4 relative overflow-hidden" style={{ borderBottom: `1px solid rgba(200,168,96,0.3)` }}>
            {/* Orrery SVG — centred illustration */}
            <svg width="120" height="96" viewBox="0 0 120 96" fill="none" className="mb-2" style={{ opacity: doomDanger ? 0.7 : 1 }}>
              {/* Base stand */}
              <rect x="51" y="86" width="18" height="4" rx="2" fill="#c8a860" opacity="0.5"/>
              <rect x="55" y="78" width="10" height="9" rx="1.5" fill="#c8a860" opacity="0.4"/>
              <line x1="60" y1="78" x2="60" y2="68" stroke="#c8a860" strokeWidth="1.2" opacity="0.4"/>
              <circle cx="60" cy="68" r="1.8" fill="#c8a860" opacity="0.5"/>
              {/* Sun */}
              <circle cx="60" cy="52" r="10" fill="rgba(201,151,58,0.12)" stroke="#c8a860" strokeWidth="0.7"/>
              <circle cx="60" cy="52" r="5.5" fill="rgba(201,151,58,0.3)" stroke="#c8a860" strokeWidth="1"/>
              <circle cx="60" cy="52" r="3" fill={doomDanger ? "rgba(192,57,43,0.7)" : "rgba(201,151,58,0.65)"}/>
              {/* Sun rays */}
              {[[60,41,60,38],[60,63,60,66],[50,52,47,52],[70,52,73,52],[53,45,51,43],[67,59,69,61],[67,45,69,43],[53,59,51,61]].map(([x1,y1,x2,y2],i) => (
                <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c8a860" strokeWidth="0.9" strokeLinecap="round" opacity={i < 4 ? 0.55 : 0.35}/>
              ))}
              {/* Orbit ring 1 — equatorial */}
              <ellipse cx="60" cy="52" rx="22" ry="8" stroke="#c8a860" strokeWidth="1.1" fill="none" opacity="0.4" transform="rotate(-10 60 52)"/>
              <circle cx="81" cy="47" r="4" fill="#4a8fd4" opacity="0.85" stroke="#f2e8cc" strokeWidth="0.7"/>
              {/* Orbit ring 2 — polar tilt */}
              <ellipse cx="60" cy="52" rx="8" ry="28" stroke="#9070b8" strokeWidth="0.9" fill="none" opacity="0.3" transform="rotate(18 60 52)"/>
              <circle cx="52" cy="25" r="3.2" fill="#7050b8" opacity="0.85" stroke="#f2e8cc" strokeWidth="0.7"/>
              {/* Orbit ring 3 — diagonal */}
              <ellipse cx="60" cy="52" rx="36" ry="13" stroke="#c8a860" strokeWidth="0.8" fill="none" opacity="0.25" transform="rotate(30 60 52)"/>
              <circle cx="28" cy="64" r="3.5" fill="#c8871a" opacity="0.8" stroke="#f2e8cc" strokeWidth="0.7"/>
              {/* Orbit ring 4 — inner */}
              <ellipse cx="60" cy="52" rx="14" ry="5" stroke="#c8a860" strokeWidth="0.7" fill="none" opacity="0.3" transform="rotate(-25 60 52)"/>
              <circle cx="74" cy="57" r="2.5" fill="#b82020" opacity="0.75" stroke="#f2e8cc" strokeWidth="0.6"/>
              {/* Outer ring */}
              <ellipse cx="60" cy="52" rx="50" ry="18" stroke="#c8a860" strokeWidth="0.6" fill="none" opacity="0.18" transform="rotate(8 60 52)"/>
              <circle cx="12" cy="47" r="3" fill="#2e8a50" opacity="0.75" stroke="#f2e8cc" strokeWidth="0.6"/>
              {/* Meridian bands */}
              <path d="M60 18 Q72 35 60 52 Q48 69 60 86" stroke="#c8a860" strokeWidth="0.5" fill="none" opacity="0.2"/>
              <path d="M60 18 Q48 35 60 52 Q72 69 60 86" stroke="#c8a860" strokeWidth="0.5" fill="none" opacity="0.2"/>
            </svg>
            {/* Session info */}
            <div className="text-center">
              <div className="text-[8px] font-mono uppercase tracking-[3px] mb-0.5" style={{ color: doomDanger ? "#c03028" : "#8a6820" }}>
                Round {turnState.round} · {turnState.phase}
              </div>
              <div className="text-[12px] font-decorative font-bold" style={{ color: "#2a1808" }}>
                {players.length} Investigator{players.length !== 1 ? "s" : ""} · {turnState.doom}/{turnState.doomThreshold} Doom
              </div>
            </div>
          </div>

          {/* Top strip: Agenda + Act side by side */}
          <div className="grid grid-cols-2" style={{ borderBottom: `1px solid ${doomDanger ? "rgba(192,57,43,0.25)" : "rgba(112,80,184,0.2)"}` }}>
            {/* DOOM side */}
            <div className="px-4 py-3" style={{ borderRight: `1px solid ${doomDanger ? "rgba(192,57,43,0.2)" : "rgba(112,80,184,0.15)"}` }}>
              <div className="flex items-center gap-1.5 mb-1">
                <DoomIcon size={12} color={doomDanger ? "#c03028" : "#9070d8"} />
                <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: doomDanger ? "#c03028" : "#9070d8" }}>Agenda</span>
                {doomDanger && <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded animate-pulse" style={{ background: "rgba(192,57,43,0.2)", color: "#c03028" }}>ADVANCE!</span>}
              </div>
              <p className="text-[11px] font-decorative font-bold text-ark-text truncate mb-1.5">{turnState.agendaName}</p>
              {/* Doom pips — Elder Sign style */}
              <div className="flex items-center gap-1 flex-wrap">
                {Array.from({ length: turnState.doomThreshold }).map((_, i) => {
                  const filled = i < turnState.doom;
                  const pipColor = filled ? (doomDanger ? "#c03028" : "#7050b8") : undefined;
                  return (
                    <button key={i}
                      onClick={() => isLead && pushTurnState({ ...turnState, doom: i < turnState.doom ? i : i + 1 })}
                      disabled={!isLead}
                      className="transition-all duration-200 flex-shrink-0"
                      style={{ opacity: isLead ? 1 : 0.85 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="9"
                          fill={filled ? (doomDanger ? "rgba(192,57,43,0.15)" : "rgba(112,80,184,0.15)") : "rgba(236,220,176,0.8)"}
                          stroke={filled ? pipColor : "rgba(138,104,32,0.3)"}
                          strokeWidth="0.9"/>
                        <line x1="10" y1="1.5" x2="10" y2="18.5" stroke={filled ? pipColor : "rgba(138,104,32,0.2)"} strokeWidth={filled ? "1.1" : "0.8"}/>
                        <line x1="1.5" y1="10" x2="18.5" y2="10" stroke={filled ? pipColor : "rgba(138,104,32,0.2)"} strokeWidth={filled ? "1.1" : "0.8"}/>
                        <line x1="3.5" y1="3.5" x2="16.5" y2="16.5" stroke={filled ? pipColor : "rgba(138,104,32,0.2)"} strokeWidth={filled ? "1.1" : "0.8"}/>
                        <line x1="16.5" y1="3.5" x2="3.5" y2="16.5" stroke={filled ? pipColor : "rgba(138,104,32,0.2)"} strokeWidth={filled ? "1.1" : "0.8"}/>
                        {filled && (
                          <>
                            <ellipse cx="10" cy="10" rx="2" ry="1.3" fill={pipColor}/>
                            <circle cx="10" cy="10" r="0.7" fill={doomDanger ? "#f2e8cc" : "#f2e8cc"}/>
                          </>
                        )}
                      </svg>
                    </button>
                  );
                })}
                <span className="text-[10px] font-mono font-bold ml-0.5" style={{ color: doomDanger ? "#c03028" : "#9070d8" }}>{turnState.doom}/{turnState.doomThreshold}</span>
              </div>
            </div>

            {/* ACT side */}
            <div className="px-4 py-3">
              {(() => {
                const cluesOnAct = turnState.cluesOnAct ?? 0;
                const needed = turnState.cluesRequired ?? 0;
                const canAdvance = cluesOnAct >= needed;
                const myClues = myPlayer?.clues ?? 0;
                // Tap a filled pip to take back a clue; tap an empty pip to commit one
                const handlePipTap = async (i: number) => {
                  if (i < cluesOnAct) {
                    // remove a clue from act → give back to current player
                    if (!myPlayer) return;
                    await updatePlayerStat(myPlayer.id, "clues", myPlayer.clues + 1);
                    await pushTurnState({ ...turnState, cluesOnAct: cluesOnAct - 1 });
                  } else {
                    // commit a clue from current player to act
                    if (!myPlayer || myPlayer.clues < 1) return;
                    await updatePlayerStat(myPlayer.id, "clues", myPlayer.clues - 1);
                    await pushTurnState({ ...turnState, cluesOnAct: cluesOnAct + 1 });
                  }
                };
                return (
                  <>
                    <div className="flex items-center gap-1.5 mb-1">
                      <ClueIcon size={12} color={canAdvance ? "#4a8fd4" : "#4a6a8a"} />
                      <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: canAdvance ? "#4a8fd4" : "#4a6a8a" }}>Act</span>
                      {turnState.scenarioNumber && <span className="text-[9px] font-mono" style={{ color: "#6a5840" }}>#{turnState.scenarioNumber}</span>}
                      {canAdvance && <span className="text-[8px] font-mono font-bold px-1 py-0.5 rounded animate-pulse" style={{ background: "rgba(74,143,212,0.2)", color: "#4a8fd4" }}>READY!</span>}
                    </div>
                    <p className="text-[11px] font-decorative font-bold text-ark-text truncate mb-1">{turnState.actName}</p>
                    <p className="text-[9px] text-ark-text-muted mb-1.5">Tap a pip to spend a clue ({myClues} in hand)</p>
                    {/* Tappable clue pips */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {Array.from({ length: needed }).map((_, i) => {
                        const filled = i < cluesOnAct;
                        const canFill = !filled && myClues > 0;
                        return (
                          <button key={i}
                            onClick={() => handlePipTap(i)}
                            disabled={!filled && myClues < 1}
                            title={filled ? "Tap to take back" : canFill ? "Tap to spend a clue" : "No clues in hand"}
                            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                            style={filled
                              ? { background: canAdvance ? "rgba(74,143,212,0.75)" : "rgba(74,138,184,0.5)", border: `1px solid ${canAdvance ? "#4a8fd4" : "#4a8ab8"}`, boxShadow: canAdvance ? "0 0 6px rgba(74,143,212,0.4)" : "none" }
                              : { background: "rgba(236,220,176,0.75)", border: "1px solid #c8a860", cursor: canFill ? "pointer" : "default" }}>
                            {filled && <ClueIcon size={10} color={canAdvance ? "#4a8fd4" : "#4a8ab8"} />}
                          </button>
                        );
                      })}
                      {needed > 0 && <span className="text-[10px] font-mono font-bold ml-1" style={{ color: canAdvance ? "#4a8fd4" : "#4a6a8a" }}>{cluesOnAct}/{needed}</span>}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Bottom strip: lead actions */}
          {isLead && (
            <div className="px-3 py-2 flex items-center gap-2 flex-wrap" style={{ background: "rgba(236,220,176,0.65)" }}>
              <button onClick={() => setShowCampaignPicker(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-decorative transition-all"
                style={{ background: "rgba(112,80,184,0.12)", border: "1px solid rgba(112,80,184,0.3)", color: "#9070d8" }}>
                Campaign
              </button>
              {(() => {
                const _cluesOnAct = turnState.cluesOnAct ?? 0;
                const _needed = turnState.cluesRequired ?? 0;
                const _canAdvance = _needed === 0 || _cluesOnAct >= _needed;
                return (
                  <button onClick={handleAdvanceAct} disabled={!_canAdvance}
                    title={_canAdvance ? "Advance the Act" : `Need ${_needed - _cluesOnAct} more clue(s) on the Act`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold font-decorative transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{ background: _canAdvance ? "rgba(74,143,212,0.15)" : "rgba(74,143,212,0.06)", border: `1px solid ${_canAdvance ? "rgba(74,143,212,0.4)" : "rgba(74,143,212,0.15)"}`, color: _canAdvance ? "#4a8fd4" : "#4a6a8a" }}>
                    Advance Act →
                  </button>
                );
              })()}
              {turnState.campaignId && turnState.campaignId !== "custom" && (
                <button onClick={handleAdvanceScenario}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold font-decorative transition-all"
                  style={{ background: "rgba(58,158,107,0.1)", border: "1px solid rgba(58,158,107,0.3)", color: "#3aad98" }}>
                  Next Scenario ↗
                </button>
              )}
              <button onClick={() => setShowEndScenario(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-decorative transition-all ml-auto"
                style={{ background: "rgba(192,57,43,0.1)", border: "1px solid rgba(192,57,43,0.3)", color: "#c03028" }}>
                End Scenario
              </button>
            </div>
          )}
        </div>

        {/* ── End Scenario modal ── */}
        {showEndScenario && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "#e8d8a8", border: "1px solid rgba(192,57,43,0.4)" }}>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.4)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#c03028" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="font-decorative font-bold text-lg text-ark-text">End Scenario</h3>
                <p className="text-xs text-ark-text-muted mt-1">This will lock the session and show the summary to all players.</p>
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted block mb-2">How did it end? (optional)</label>
                <input value={scenarioResolutionText} onChange={e => setScenarioResolutionText(e.target.value)}
                  placeholder="e.g. Victory — Cultist defeated, 3 trauma taken"
                  className="ark-input w-full px-3 py-2.5 rounded-lg text-sm" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEndScenario(false)} className="btn-ghost flex-1 py-2.5 text-sm rounded-xl">Cancel</button>
                <button onClick={handleEndScenario}
                  className="flex-1 py-2.5 text-sm rounded-xl font-bold font-decorative transition-all"
                  style={{ background: "linear-gradient(135deg, rgba(192,57,43,0.8), rgba(140,30,20,0.8))", color: "#fff", border: "1px solid rgba(192,48,40,0.4)" }}>
                  End Scenario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Scenario Summary screen (shown to all devices) ── */}
        {showScenarioSummary && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(10px)" }}>
            <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col" style={{ background: "#ecdcb0", border: "1px solid rgba(201,151,58,0.35)", maxHeight: "90vh" }}>
              <div className="px-5 py-4 text-center flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(201,151,58,0.12), rgba(248,240,216,0.5))", borderBottom: "1px solid rgba(201,151,58,0.2)" }}>
                <div className="text-2xl mb-2">📜</div>
                <h2 className="font-decorative font-bold text-xl text-ark-text">Scenario Complete</h2>
                {turnState.scenarioResolution && (
                  <p className="text-sm mt-1" style={{ color: "#c9973a" }}>{turnState.scenarioResolution}</p>
                )}
                <p className="text-xs text-ark-text-muted mt-1">Round {turnState.round} · {players.length} investigator{players.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-3">
                {players.map(p => {
                  const inv = investigators.find(i => i.name === p.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  const isDefeated = p.damage >= (inv?.health ?? 9);
                  const isInsane = p.horror >= (inv?.sanity ?? 7);
                  return (
                    <div key={p.id} className="rounded-xl p-4" style={{ background: "rgba(236,220,176,0.9)", border: `1px solid ${cls.border}` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex }}>{p.investigator[0]}</div>
                        <div>
                          <p className="font-decorative font-bold text-sm text-ark-text">{p.player_name}</p>
                          <p className="text-[11px]" style={{ color: cls.hex }}>{p.investigator} · {inv?.class}</p>
                        </div>
                        {(isDefeated || isInsane) && (
                          <span className="ml-auto text-[9px] font-mono font-bold px-2 py-0.5 rounded" style={{ background: isDefeated ? "rgba(192,57,43,0.2)" : "rgba(112,80,184,0.2)", color: isDefeated ? "#c03028" : "#9070d8" }}>
                            {isDefeated ? "DEFEATED" : "INSANE"}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: "Damage", val: p.damage, max: inv?.health ?? 9, color: "#c03028" },
                          { label: "Horror", val: p.horror, max: inv?.sanity ?? 7, color: "#9070d8" },
                          { label: "Resources", val: p.resources, max: null, color: "#c9973a" },
                          { label: "Clues", val: p.clues, max: null, color: "#4a8fd4" },
                        ].map(s => (
                          <div key={s.label} className="text-center py-2 rounded-lg" style={{ background: "rgba(236,220,176,0.65)" }}>
                            <div className="text-[8px] font-mono text-ark-text-muted">{s.label}</div>
                            <div className="font-mono font-bold text-sm mt-0.5" style={{ color: s.color }}>{s.val}{s.max ? `/${s.max}` : ""}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Log summary */}
                <div className="rounded-xl p-3" style={{ background: "rgba(236,220,176,0.8)", border: "1px solid #c8a860" }}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-2">{actionLog.length} actions logged this scenario</p>
                  {actionLog.filter(e => e.action === "Enemy Defeated").length > 0 && (
                    <p className="text-xs text-ark-text-muted">Enemies defeated: {actionLog.filter(e => e.action === "Enemy Defeated").map(e => e.detail.split(" defeated")[0]).join(", ")}</p>
                  )}
                </div>
              </div>
              <div className="px-5 py-4 flex-shrink-0 space-y-2" style={{ borderTop: "1px solid rgba(201,151,58,0.2)" }}>
                {isLead && (
                  <button onClick={() => { setShowScenarioSummary(false); setShowCarryOverModal(true); }}
                    className="w-full py-3 rounded-xl font-bold font-decorative text-sm"
                    style={{ background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#2a1808" }}>
                    Continue to Next Scenario →
                  </button>
                )}
                <button onClick={() => setShowScenarioSummary(false)}
                  className="w-full py-2.5 rounded-xl text-sm btn-ghost">
                  Close Summary
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Carry-Over modal (next session setup) ── */}
        {showCarryOverModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-sm rounded-2xl p-6 space-y-4" style={{ background: "#e8d8a8", border: "1px solid rgba(58,173,152,0.3)" }}>
              <h3 className="font-decorative font-bold text-lg text-ark-text">Next Session Carry-Over</h3>
              <p className="text-xs text-ark-text-muted">When starting the next session, remind your group which of these carry over between scenarios:</p>
              <div className="space-y-2">
                {[
                  { label: "XP (experience points)", color: "#c9973a", carries: true, note: "Spend between scenarios on upgrades" },
                  { label: "Trauma (physical + mental)", color: "#c03028", carries: true, note: "Reduce max HP/Sanity permanently" },
                  { label: "Resources & Clues", color: "#4a8fd4", carries: false, note: "Reset to starting values (5 resources, 0 clues)" },
                  { label: "Damage & Horror", color: "#9070d8", carries: false, note: "Healed between scenarios (unless defeated/insane)" },
                  { label: "Cards in hand & deck", color: "#3aad98", carries: true, note: "Keep your deck; some cards may be lost via trauma" },
                  { label: "Earned campaign items", color: "#c9973a", carries: true, note: "Story items and campaign log entries carry over" },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-2.5 p-2.5 rounded-lg" style={{ background: item.carries ? "rgba(236,220,176,0.75)" : "rgba(200,168,96,0.15)", border: `1px solid ${item.carries ? item.color + "30" : "#3d302010"}` }}>
                    <span className="text-sm flex-shrink-0">{item.carries ? "✓" : "✗"}</span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: item.carries ? item.color : "#5a4838" }}>{item.label}</p>
                      <p className="text-[10px] text-ark-text-muted">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowCarryOverModal(false); handleAdvanceScenario(); }}
                className="w-full py-3 rounded-xl font-bold font-decorative text-sm"
                style={{ background: "linear-gradient(135deg, rgba(58,173,152,0.8), rgba(58,158,107,0.8))", color: "#2a1808" }}>
                Got it — Advance to Next Scenario
              </button>
              <button onClick={() => setShowCarryOverModal(false)} className="btn-ghost w-full py-2 text-sm rounded-xl">Close</button>
            </div>
          </div>
        )}

        {/* ── Campaign picker modal ── */}
        {showCampaignPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
            <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#e8d8a8", border: "1px solid rgba(112,80,184,0.3)" }}>
              <h3 className="font-decorative font-bold text-lg text-ark-text">Select Campaign &amp; Scenario</h3>

              {/* Step 1 — Campaign list */}
              {selectedCampaignId === null ? (
                <div className="space-y-2">
                  {CAMPAIGNS.map(campaign => (
                    <button key={campaign.id}
                      onClick={() => setSelectedCampaignId(campaign.id)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left"
                      style={{ background: "rgba(112,80,184,0.08)", border: "1px solid rgba(112,80,184,0.25)" }}>
                      <div className="flex-1">
                        <p className="font-decorative font-bold text-sm text-ark-text">{campaign.name}</p>
                        <p className="text-xs text-ark-text-muted">{campaign.subtitle}</p>
                      </div>
                      <span className="text-ark-text-muted text-xs">→</span>
                    </button>
                  ))}
                </div>

              ) : selectedCampaignId === "custom" ? (
                /* Step 2b — Custom / Freeform entry form */
                <div className="space-y-3">
                  <button onClick={() => setSelectedCampaignId(null)} className="text-xs text-ark-text-muted hover:text-ark-text">
                    ← Back to campaigns
                  </button>
                  <p className="text-xs text-ark-text-muted italic">Fill in the details for your custom scenario. Only the Scenario Name is required.</p>

                  {/* Campaign name */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-1">Campaign Name (optional)</label>
                    <input value={customCampaignName} onChange={e => setCustomCampaignName(e.target.value)}
                      placeholder="e.g. The Dunwich Legacy"
                      className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                  </div>

                  {/* Scenario name */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-1">Scenario Name *</label>
                    <input value={customScenarioName} onChange={e => setCustomScenarioName(e.target.value)}
                      placeholder="e.g. Extracurricular Activity"
                      className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                  </div>

                  {/* Agenda name */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-1">Agenda Name (optional)</label>
                    <input value={customAgendaName} onChange={e => setCustomAgendaName(e.target.value)}
                      placeholder="e.g. Something Stirs…"
                      className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                  </div>

                  {/* Act name */}
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-1">Act Name (optional)</label>
                    <input value={customActName} onChange={e => setCustomActName(e.target.value)}
                      placeholder="e.g. Investigating the Campus"
                      className="ark-input w-full px-3 py-2 rounded-lg text-sm" />
                  </div>

                  {/* Doom threshold + Clues required */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg p-2 text-center" style={{ background: "rgba(112,80,184,0.08)", border: "1px solid rgba(112,80,184,0.25)" }}>
                      <p className="text-[9px] font-mono uppercase tracking-wide text-ark-text-muted mb-1.5">Doom Threshold</p>
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setCustomDoomThreshold(v => Math.max(1, v - 1))} className="w-6 h-6 rounded font-bold" style={{ background: "rgba(112,80,184,0.15)", color: "#9070d8" }}>−</button>
                        <span className="font-mono font-bold text-base text-ark-text w-5 text-center">{customDoomThreshold}</span>
                        <button onClick={() => setCustomDoomThreshold(v => v + 1)} className="w-6 h-6 rounded font-bold" style={{ background: "rgba(112,80,184,0.15)", color: "#9070d8" }}>+</button>
                      </div>
                    </div>
                    <div className="rounded-lg p-2 text-center" style={{ background: "rgba(58,173,152,0.08)", border: "1px solid rgba(58,173,152,0.25)" }}>
                      <p className="text-[9px] font-mono uppercase tracking-wide text-ark-text-muted mb-1.5">Clues Required</p>
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setCustomCluesRequired(v => Math.max(0, v - 1))} className="w-6 h-6 rounded font-bold" style={{ background: "rgba(58,173,152,0.15)", color: "#3aad98" }}>−</button>
                        <span className="font-mono font-bold text-base text-ark-text w-5 text-center">{customCluesRequired}</span>
                        <button onClick={() => setCustomCluesRequired(v => v + 1)} className="w-6 h-6 rounded font-bold" style={{ background: "rgba(58,173,152,0.15)", color: "#3aad98" }}>+</button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSelectCustomScenario}
                    disabled={!customScenarioName.trim()}
                    className="w-full py-3 rounded-xl text-sm font-bold font-decorative transition-all disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg, #5a3a8a, #3a2060)", color: "#fff", border: "1px solid rgba(112,80,184,0.4)" }}>
                    Begin This Scenario
                  </button>
                </div>

              ) : (
                /* Step 2a — Named campaign scenario list */
                <div className="space-y-2">
                  <button onClick={() => setSelectedCampaignId(null)} className="text-xs text-ark-text-muted hover:text-ark-text mb-2">
                    ← Back to campaigns
                  </button>
                  {(() => {
                    const campaign = CAMPAIGNS.find(c => c.id === selectedCampaignId);
                    return campaign?.scenarios.map((scenario, idx) => (
                      <button key={scenario.id}
                        onClick={() => handleSelectScenario(selectedCampaignId, scenario.id)}
                        className="w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left"
                        style={{ background: "rgba(58,173,152,0.08)", border: "1px solid rgba(58,173,152,0.25)" }}>
                        <div className="flex items-center justify-center rounded-full flex-shrink-0 text-[10px] font-mono font-bold"
                          style={{ width: 22, height: 22, background: "rgba(58,173,152,0.18)", color: "#3aad98", border: "1px solid rgba(58,173,152,0.35)" }}>
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-decorative font-bold text-sm text-ark-text">{scenario.name}</p>
                          <p className="text-[10px] text-ark-text-muted">{scenario.agendaName} · Doom {scenario.doomThreshold} · {scenario.cluesRequired} clues</p>
                        </div>
                      </button>
                    ));
                  })()}
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
                      style={{ background: "rgba(112,80,184,0.15)", border: "1px solid rgba(112,80,184,0.4)", color: "#9070d8" }}>
                      + Place Doom
                    </button>
                  )}
                  {turnState.phase === "mythos" && (
                    <button onClick={() => handleLeadPhaseAction("Encounter Cards Drawn", "All investigators drew encounter cards")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                      style={{ background: "rgba(112,80,184,0.1)", border: "1px solid rgba(112,80,184,0.3)", color: "#9070d8" }}>
                      Log Encounter Draw
                    </button>
                  )}
                  {turnState.phase === "enemy" && (
                    <button onClick={() => handleLeadPhaseAction("Hunter Enemies Moved", "Hunter enemies moved toward nearest investigator")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                      style={{ background: "rgba(192,48,40,0.12)", border: "1px solid rgba(192,48,40,0.4)", color: "#c03028" }}>
                      Log Hunter Move
                    </button>
                  )}
                  {turnState.phase === "enemy" && (
                    <button onClick={() => handleLeadPhaseAction("Enemies Attacked", "All engaged ready enemies attacked")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                      style={{ background: "rgba(192,48,40,0.1)", border: "1px solid rgba(192,48,40,0.3)", color: "#c03028" }}>
                      Log Enemy Attacks
                    </button>
                  )}
                  {turnState.phase === "upkeep" && (
                    <>
                      {(enemies.some(e => e.exhausted)) && (
                        <button onClick={handleReadyAllEnemies}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                          style={{ background: "rgba(58,173,152,0.15)", border: "1px solid rgba(58,173,152,0.5)", color: "#3aad98" }}>
                          ✓ Ready All Enemies
                        </button>
                      )}
                      <button onClick={() => handleLeadPhaseAction("Upkeep Resolved", "All cards readied, each investigator drew 1 card and gained 1 resource")}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                        style={{ background: "rgba(58,173,152,0.12)", border: "1px solid rgba(58,173,152,0.4)", color: "#3aad98" }}>
                        Log Upkeep Done
                      </button>
                    </>
                  )}
                  <button onClick={handleAdvancePhase}
                    className="px-4 py-2 rounded-xl text-sm font-bold font-decorative transition-all"
                    style={{ background: `linear-gradient(135deg, ${currentPhase.color}cc, ${currentPhase.color}88)`, color: "#2a1808", boxShadow: `0 0 16px ${currentPhase.color}40` }}>
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

        {/* ── Active turn indicator + live recent action feed ── */}
        {turnState.phase === "investigation" && currentPlayer && !isMyTurn && (
          <div className="rounded-xl mb-4 overflow-hidden" style={{ border: "1px solid #c8a860" }}>
            {/* Who's taking their turn */}
            {(() => {
              const inv = investigators.find(i => i.name === currentPlayer.investigator);
              const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
              return (
                <div className="p-3 flex items-center gap-3" style={{ background: "rgba(236,220,176,0.85)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0" style={{ background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex }}>{currentPlayer.investigator[0]}</div>
                  <div className="flex-1 min-w-0">
                    <span className="font-decorative font-bold text-sm text-ark-text">{currentPlayer.player_name}</span>
                    <span className="text-ark-text-muted text-xs ml-2">is taking their turn</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={i < (3 - turnState.actionsUsed)
                          ? { background: cls.bg, border: `1px solid ${cls.border}` }
                          : { background: "rgba(236,220,176,0.8)", border: "1px solid rgba(138,104,32,0.2)", opacity: 0.4 }}>
                        <ActionSymbol size={10} />
                      </div>
                    ))}
                    <span className="text-[10px] text-ark-text-muted ml-1">{3 - turnState.actionsUsed} left</span>
                  </div>
                </div>
              );
            })()}
            {/* Live recent actions (last 3 actions from current player this round) */}
            {(() => {
              const recentActions = actionLog
                .filter(e => e.playerName === currentPlayer.player_name && e.round === turnState.round && e.action !== "End Turn" && e.action !== "Enemy Spawned" && e.action !== "Enemy Attack" && e.action !== "Enemy Defeated")
                .slice(0, 3);
              if (recentActions.length === 0) return null;
              const inv = investigators.find(i => i.name === currentPlayer.investigator);
              const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
              return (
                <div className="px-3 pb-2 space-y-1" style={{ background: "rgba(236,220,176,0.75)", borderTop: "1px solid rgba(138,104,32,0.2)" }}>
                  {recentActions.map(e => {
                    const adef = ACTIONS.find(a => a.label === e.action);
                    return (
                      <div key={e.id} className="flex items-center gap-2 py-1">
                        <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: adef ? adef.bg : "rgba(61,48,32,0.3)" }}>
                          {adef?.skill ? <SkillIcon skill={adef.skill} size={9} /> : <ActionSymbol size={9} />}
                        </div>
                        <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: adef?.color ?? cls.hex }}>{e.action}</span>
                        {e.detail && <span className="text-[10px] text-ark-text-muted truncate">{e.detail}</span>}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── Quick-access bar: enemies count + log shortcut ── */}
        {turnState.gameStarted && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => setActiveTab("enemies")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-1 justify-center"
              style={enemies.length > 0
                ? { background: "rgba(192,48,40,0.1)", border: "1px solid rgba(192,48,40,0.35)", color: "#c03028" }
                : { background: "rgba(236,220,176,0.8)", border: "1px solid #c8a860", color: "#5a4838" }}>
              <CombatIcon size={12} color={enemies.length > 0 ? "#c03028" : "#5a4838"} />
              {enemies.length > 0 ? `${enemies.length} Enem${enemies.length === 1 ? "y" : "ies"} in Play` : "No Enemies"}
            </button>
            <button onClick={() => setActiveTab("log")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-1 justify-center"
              style={{ background: "rgba(236,220,176,0.8)", border: "1px solid #c8a860", color: "#6b5840" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              {actionLog.length} Action{actionLog.length !== 1 ? "s" : ""} Logged
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit overflow-x-auto" style={{ background: "rgba(236,220,176,0.9)", border: "1px solid #c8a860" }}>
          {(["board","enemies","log","reference"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold font-decorative tracking-wide transition-all duration-200 whitespace-nowrap"
              style={activeTab === tab
                ? { background: "linear-gradient(135deg, #c9973a, #a07828)", color: "#2a1808", boxShadow: "0 2px 8px rgba(201,151,58,0.3)" }
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
                style={{ background: "rgba(201,151,58,0.06)", border: "1px solid rgba(201,151,58,0.3)" }}>
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201,151,58,0.5), transparent)" }} />
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #c9973a, #8b6914)", boxShadow: "0 0 16px rgba(201,151,58,0.35)" }}>
                      <svg viewBox="0 0 20 20" className="w-5 h-5 fill-current" style={{ color: "#2a1808" }}><path d="M10 2L12.4 7.5H18L13.4 11L15.3 17L10 13.5L4.7 17L6.6 11L2 7.5H7.6L10 2Z"/></svg>
                    </div>
                    <div>
                      <p className="text-[10px] font-decorative uppercase tracking-widest" style={{ color: "#c9973a" }}>Lead Investigator</p>
                      <p className="font-decorative font-bold text-base text-ark-text">{leadPlayer.player_name}</p>
                      <p className="text-xs text-ark-text-muted">{leadPlayer.investigator}</p>
                    </div>
                  </div>
                  {isCreator && (
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
                                  : { background: "transparent", border: "1px solid #c8a860", color: "#5a4838" }}>
                                {p.player_name}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                      <button onClick={() => setReorderMode(!reorderMode)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all"
                        style={{ background: reorderMode ? "rgba(58,173,152,0.15)" : "rgba(201,151,58,0.08)", border: reorderMode ? "1px solid rgba(58,173,152,0.4)" : "1px solid rgba(201,151,58,0.25)", color: reorderMode ? "#3aad98" : "#c9973a" }}>
                        {reorderMode ? "✓ Done" : "⇅ Reorder Turn"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add investigator */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-decorative uppercase tracking-widest text-ark-text-muted">Investigators ({players.length})</h3>
                {isCreator && (
                  <button onClick={() => setShowAddPlayer(!showAddPlayer)}
                    className="text-xs font-semibold font-decorative px-3 py-1.5 rounded-lg transition-all"
                    style={{ background: "rgba(201,151,58,0.08)", border: "1px solid rgba(201,151,58,0.25)", color: "#c9973a" }}>
                    + Add Investigator
                  </button>
                )}
              </div>

              {isCreator && showAddPlayer && (
                <div className="rounded-xl p-4 mb-4 space-y-3" style={{ background: "rgba(236,220,176,0.9)", border: "1px solid rgba(201,151,58,0.2)" }}>
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
                <div className="rounded-xl p-10 text-center" style={{ background: "rgba(236,220,176,0.7)", border: "1px dashed #c8a860" }}>
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
                    const maxHealth = inv?.health ?? 9;
                    const maxSanity = inv?.sanity ?? 7;
                    const healthRemaining = Math.max(0, maxHealth - player.damage);
                    const sanityRemaining = Math.max(0, maxSanity - player.horror);
                    const healthPct = Math.min((healthRemaining / maxHealth) * 100, 100);
                    const sanityPct = Math.min((sanityRemaining / maxSanity) * 100, 100);
                    const isDefeated = player.damage >= maxHealth;
                    const isInsane = player.horror >= maxSanity;
                    const engagedEnemies = enemies.filter(e => e.engagedPlayerIds?.includes(player.id));

                    return (
                      <div key={player.id} className="rounded-xl p-4 relative transition-all duration-300"
                        style={{
                          background: "linear-gradient(145deg, #ecdcb0, #e4d4a0)",
                          border: isMe ? `2px solid ${cls.border}` : isActive ? `1px solid ${cls.border}` : "1px solid #3d3020",
                          boxShadow: isMe ? `0 0 24px ${cls.glow}, 0 4px 20px rgba(0,0,0,0.5)` : isActive ? `0 0 14px ${cls.glow}` : "none",
                        }}>

                        {/* Delete button — creator only */}
                        {isCreator && (
                          <button onClick={() => handleRemove(player)}
                            className="absolute top-3 right-3 w-6 h-6 rounded-full text-xs flex items-center justify-center opacity-0 hover:opacity-100 focus:opacity-100 transition-all"
                            style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#c03028" }}
                            aria-label={`Remove ${player.player_name}`}>
                            ✕
                          </button>
                        )}

                        {/* Reorder buttons (if in reorderMode and isCreator) */}
                        {reorderMode && isCreator && (
                          <div className="absolute left-3 top-3 flex flex-col gap-1">
                            <button onClick={() => handleReorderPlayer(player.id, "up")}
                              disabled={orderedPlayers[0]?.id === player.id}
                              className="w-5 h-5 rounded text-xs flex items-center justify-center transition-all disabled:opacity-30"
                              style={{ background: "rgba(58,173,152,0.2)", border: "1px solid rgba(58,173,152,0.4)", color: "#3aad98" }}>
                              ↑
                            </button>
                            <button onClick={() => handleReorderPlayer(player.id, "down")}
                              disabled={orderedPlayers[orderedPlayers.length - 1]?.id === player.id}
                              className="w-5 h-5 rounded text-xs flex items-center justify-center transition-all disabled:opacity-30"
                              style={{ background: "rgba(58,173,152,0.2)", border: "1px solid rgba(58,173,152,0.4)", color: "#3aad98" }}>
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
                            style={{ background: isDefeated ? "rgba(192,57,43,0.15)" : "rgba(112,80,184,0.15)", color: isDefeated ? "#c03028" : "#9070d8", border: `1px solid ${isDefeated ? "rgba(192,57,43,0.3)" : "rgba(112,80,184,0.3)"}` }}>
                            {isDefeated ? "DEFEATED — Take 1 Physical Trauma" : "INSANE — Take 1 Mental Trauma"}
                          </div>
                        )}

                        {/* Engaged enemies */}
                        {engagedEnemies.length > 0 && (
                          <div className="mb-2 px-2 py-1.5 rounded-lg text-[10px]" style={{ background: "rgba(192,48,40,0.08)", border: "1px solid rgba(192,48,40,0.3)" }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <CombatIcon size={11} color="#c03028" />
                              <span className="font-decorative font-bold" style={{ color: "#c03028" }}>{engagedEnemies.length} enemy engaged — AoO applies!</span>
                            </div>
                            {engagedEnemies.map(e => (
                              <div key={e.id} className="text-[10px] pl-4" style={{ color: "#c08080" }}>
                                {e.name} • Fght {e.fightVal} / Evd {e.evadeVal} / HP {e.currentDamage}/{e.health}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Health bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] font-mono text-ark-text-muted">❤ Health</span>
                            <span className="text-[9px] font-mono" style={{ color: healthPct > 66 ? "#3aad98" : healthPct > 33 ? "#d4922a" : "#c05050" }}>
                              {healthRemaining}/{maxHealth}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "rgba(236,220,176,0.65)" }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${healthPct}%`, background: healthPct > 66 ? "linear-gradient(90deg, #2a7048, #3aad98)" : healthPct > 33 ? "linear-gradient(90deg, #8a6010, #d4922a)" : "linear-gradient(90deg, #8e1a0e, #c05050)" }} />
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleStatChange(player, "damage", 1)}
                              className="flex-1 rounded py-1 text-[10px] font-bold font-mono transition-colors"
                              style={{ background: "rgba(192,48,40,0.15)", color: "#c03028", border: "1px solid rgba(192,48,40,0.3)" }}>
                              − Hurt
                            </button>
                            <button onClick={() => handleStatChange(player, "damage", -1)}
                              className="flex-1 rounded py-1 text-[10px] font-bold font-mono transition-colors"
                              style={{ background: "rgba(58,158,107,0.1)", color: "#3aad98", border: "1px solid rgba(58,158,107,0.25)" }}>
                              + Heal
                            </button>
                          </div>
                        </div>

                        {/* Sanity bar */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] font-mono text-ark-text-muted">🧠 Sanity</span>
                            <span className="text-[9px] font-mono" style={{ color: sanityPct > 66 ? "#3aad98" : sanityPct > 33 ? "#d4922a" : "#c05050" }}>
                              {sanityRemaining}/{maxSanity}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: "rgba(236,220,176,0.65)" }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${sanityPct}%`, background: sanityPct > 66 ? "linear-gradient(90deg, #4a68b8, #4a8fd4)" : sanityPct > 33 ? "linear-gradient(90deg, #5c6eb5, #8ab3f5)" : "linear-gradient(90deg, #6c4280, #9070d8)" }} />
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => handleStatChange(player, "horror", 1)}
                              className="flex-1 rounded py-1 text-[10px] font-bold font-mono transition-colors"
                              style={{ background: "rgba(144,112,216,0.15)", color: "#9070d8", border: "1px solid rgba(144,112,216,0.3)" }}>
                              − Horror
                            </button>
                            <button onClick={() => handleStatChange(player, "horror", -1)}
                              className="flex-1 rounded py-1 text-[10px] font-bold font-mono transition-colors"
                              style={{ background: "rgba(58,158,107,0.1)", color: "#3aad98", border: "1px solid rgba(58,158,107,0.25)" }}>
                              + Recover
                            </button>
                          </div>
                        </div>

                        {/* Resource stats */}
                        <div className="grid grid-cols-2 gap-1 mb-2.5">
                          {[
                            { label: "Resources", val: player.resources, color: "#c9973a", field: "resources" as const },
                            { label: "Clues", val: player.clues, color: "#4a8fd4", field: "clues" as const },
                          ].map(s => (
                            <div key={s.label} className="flex items-center gap-1 py-1 px-2 rounded" style={{ background: "rgba(236,220,176,0.35)" }}>
                              <div className="flex-1">
                                <div className="text-[9px] font-mono text-ark-text-muted">{s.label}</div>
                                <div className="font-mono font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                              </div>
                              <div className="flex gap-0.5">
                                <button onClick={() => handleStatChange(player, s.field, -1)} className="w-4 h-4 rounded text-[8px] font-bold" style={{ background: "rgba(236,220,176,0.75)" }}>−</button>
                                <button onClick={() => handleStatChange(player, s.field, 1)} className="w-4 h-4 rounded text-[8px] font-bold" style={{ background: "rgba(236,220,176,0.75)" }}>+</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Skill stats */}
                        {inv && (
                          <div className="grid grid-cols-4 gap-1 pt-2.5" style={{ borderTop: "1px solid rgba(138,104,32,0.2)" }}>
                            {[
                              { label: "WIL", val: inv.willpower, color: "#9070d8", skill: "WIL" },
                              { label: "INT", val: inv.intellect, color: "#4a8fd4", skill: "INT" },
                              { label: "COM", val: inv.combat,    color: "#c03028", skill: "COM" },
                              { label: "AGI", val: inv.agility,   color: "#3aad98", skill: "AGI" },
                            ].map(s => (
                              <div key={s.label} className="text-center py-1.5 rounded" style={{ background: "rgba(236,220,176,0.35)" }}>
                                <SkillIcon skill={s.skill} size={12} />
                                <div className="text-[9px] text-ark-text-muted font-mono mt-0.5">{s.label}</div>
                                <div className="font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ability */}
                        {inv && (
                          <div className="mt-2.5 pt-2.5 px-2 py-2 rounded-lg" style={{ borderTop: "1px solid rgba(138,104,32,0.2)", background: `${cls.bg}` }}>
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
          <div className="space-y-3">

            {/* ── Non-lead read-only notice ── */}
            {!isLead && (
              <div className="rounded-xl px-4 py-3 flex items-center gap-3"
                style={{ background: "rgba(201,151,58,0.06)", border: "1px solid rgba(201,151,58,0.2)" }}>
                <span className="text-lg">👁</span>
                <div>
                  <p className="text-xs font-decorative font-bold text-ark-text">View only</p>
                  <p className="text-[11px] text-ark-text-muted">{leadPlayer?.player_name ?? "Lead investigator"} manages enemies during the Enemy Phase.</p>
                </div>
              </div>
            )}

            {/* ── Spawn form (lead only) ── */}
            {isLead && (
              <>
                {!showAddEnemy ? (
                  <button onClick={() => setShowAddEnemy(true)}
                    className="w-full py-3 rounded-xl text-sm font-bold font-decorative transition-all"
                    style={{ background: "rgba(192,48,40,0.08)", border: "1px dashed rgba(192,48,40,0.35)", color: "#c03028" }}>
                    + Spawn Enemy from encounter card
                  </button>
                ) : (
                  <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(192,48,40,0.04)", border: "1px solid rgba(192,48,40,0.25)" }}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-decorative font-bold text-sm" style={{ color: "#c03028" }}>New Enemy</h4>
                      <button onClick={() => { setShowAddEnemy(false); setCardSearch(""); }}
                        className="text-[11px] text-ark-text-muted px-2 py-1 rounded hover:text-ark-text">Cancel</button>
                    </div>

                    {/* Card search autocomplete */}
                    <div className="relative">
                      <input
                        value={cardSearch}
                        onChange={e => {
                          const v = e.target.value;
                          setCardSearch(v);
                          const results = searchCards(v, ["enemy", "story-enemy"]);
                          setCardResults(results);
                          setShowCardDropdown(results.length > 0);
                          setNewEnemy(p => ({ ...p, name: v }));
                        }}
                        onBlur={() => setTimeout(() => setShowCardDropdown(false), 150)}
                        onFocus={() => {
                          if (cardSearch.length > 0) {
                            const results = searchCards(cardSearch, ["enemy", "story-enemy"]);
                            setCardResults(results);
                            setShowCardDropdown(results.length > 0);
                          }
                        }}
                        onKeyDown={e => { if (e.key === "Enter" && !showCardDropdown) handleAddEnemy(); }}
                        placeholder="Type enemy name — or search to auto-fill stats"
                        className="ark-input w-full px-3 py-2.5 rounded-lg text-sm"
                        autoFocus
                      />
                      {showCardDropdown && cardResults.length > 0 && (
                        <ul className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-xl"
                          style={{ background: "#ecdcb0", border: "1px solid rgba(192,48,40,0.4)" }}>
                          {cardResults.map(card => {
                            const preset = getEnemyPreset(card.id);
                            return (
                              <li key={card.id}>
                                <button className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors"
                                  onMouseDown={() => {
                                    if (preset) {
                                      setNewEnemy(p => ({ ...p, name: preset.name, fightVal: preset.fightVal, evadeVal: preset.evadeVal, health: preset.health, damage: preset.damage, horror: preset.horror, keywords: preset.keywords, massive: preset.keywords.includes("Massive") }));
                                      setCardSearch(preset.name);
                                    } else {
                                      setNewEnemy(p => ({ ...p, name: card.name }));
                                      setCardSearch(card.name);
                                    }
                                    setShowCardDropdown(false);
                                  }}>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-decorative text-sm text-ark-text">{card.name}</span>
                                    {preset && <span className="text-[10px] font-mono text-ark-text-muted shrink-0">Fight {preset.fightVal} · Evade {preset.evadeVal} · HP {preset.health}</span>}
                                  </div>
                                  {card.keywords && card.keywords.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {card.keywords.map(k => <span key={k} className="text-[9px] font-mono px-1 rounded" style={{ background: "rgba(192,48,40,0.12)", color: "#c03028" }}>{k}</span>)}
                                    </div>
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {/* Stats — 2 rows of clear labels */}
                    <div className="grid grid-cols-3 gap-2">
                      {(["fightVal","evadeVal","health","damage","horror"] as const).map(f => (
                        <div key={f} className="rounded-lg p-2 text-center" style={{ background: "rgba(236,220,176,0.75)", border: "1px solid rgba(138,104,32,0.2)" }}>
                          <div className="text-[9px] font-mono uppercase tracking-wide text-ark-text-muted mb-1.5">
                            {({fightVal:"⚔ Fight",evadeVal:"🏃 Evade",health:"❤ Max HP",damage:"💀 Atk DMG",horror:"🧠 Atk HOR"} as Record<string,string>)[f]}
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setNewEnemy(p => ({ ...p, [f]: Math.max(0, p[f] - 1) }))} className="w-6 h-6 rounded text-sm font-bold" style={{ background: "rgba(192,48,40,0.15)", color: "#c03028" }}>−</button>
                            <span className="font-mono font-bold text-base text-ark-text w-5 text-center">{newEnemy[f]}</span>
                            <button onClick={() => setNewEnemy(p => ({ ...p, [f]: p[f] + 1 }))} className="w-6 h-6 rounded text-sm font-bold" style={{ background: "rgba(192,48,40,0.15)", color: "#c03028" }}>+</button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Keywords */}
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-ark-text-muted mb-2">Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ENEMY_KEYWORDS.map(k => (
                          <button key={k.key} onClick={() => toggleEnemyKeyword(k.key)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all"
                            style={newEnemy.keywords.includes(k.key)
                              ? { background: `${k.color}20`, border: `1px solid ${k.color}60`, color: k.color }
                              : { background: "transparent", border: "1px solid #c8a860", color: "#5a4838" }}>
                            {k.key}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleAddEnemy} disabled={!newEnemy.name.trim()}
                      className="w-full py-3 rounded-xl text-sm font-bold font-decorative transition-all disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg, #a03020, #7a1a0a)", color: "#fff", border: "1px solid rgba(192,48,40,0.4)" }}>
                      Spawn Enemy
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── Active enemies ── */}
            {enemies.length === 0 ? (
              <div className="rounded-xl p-10 text-center" style={{ background: "rgba(236,220,176,0.7)", border: "1px dashed rgba(184,32,32,0.3)" }}>
                <p className="text-2xl mb-2">🕯</p>
                <p className="text-ark-text-muted text-sm">No enemies in play.</p>
                <p className="text-[10px] text-ark-text-muted mt-1">Add one when an encounter card reveals an enemy.</p>
              </div>
            ) : enemies.map(enemy => {
              const hpLeft = Math.max(0, enemy.health - enemy.currentDamage);
              const hpPct = Math.min((hpLeft / Math.max(1, enemy.health)) * 100, 100);
              const isMassive = enemy.keywords.includes("Massive");
              const engagedNames = enemy.engagedPlayerIds.map(id => players.find(p => p.id === id)?.player_name ?? "?").join(", ");

              return (
                <div key={enemy.id} className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    border: enemy.exhausted ? "1px solid rgba(74,143,212,0.35)" : "1px solid rgba(192,48,40,0.4)",
                    opacity: enemy.exhausted ? 0.8 : 1,
                    background: enemy.exhausted ? "rgba(8,14,22,0.95)" : "rgba(20,8,5,0.95)",
                  }}>

                  {/* ── Row 1: Name + status badges + defeat button ── */}
                  <div className="px-4 pt-3 pb-2 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-decorative font-bold text-base text-ark-text leading-tight">{enemy.name}</h4>
                        {enemy.exhausted && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(74,143,212,0.15)", color: "#4a8fd4" }}>EXHAUSTED</span>
                        )}
                        {isMassive && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(232,168,74,0.15)", color: "#c8871a" }}>MASSIVE</span>
                        )}
                      </div>
                      {/* Keywords inline */}
                      <div className="flex flex-wrap gap-1">
                        {enemy.keywords.filter(k => k !== "Massive").map(kw => {
                          const kwDef = ENEMY_KEYWORDS.find(k => k.key === kw);
                          return <span key={kw} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: `${kwDef?.color ?? "#888"}15`, color: kwDef?.color ?? "#888" }}>{kw}</span>;
                        })}
                      </div>
                    </div>
                    {isLead && (
                      <button onClick={() => handleDefeatEnemy(enemy.id)}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-lg flex-shrink-0 transition-all"
                        style={{ background: "rgba(58,158,107,0.12)", border: "1px solid rgba(58,158,107,0.35)", color: "#3aad98" }}>
                        ✓ Defeat
                      </button>
                    )}
                  </div>

                  {/* ── Row 2: Key stats — compact, readable ── */}
                  <div className="mx-4 mb-2 grid grid-cols-4 gap-1.5 rounded-lg overflow-hidden"
                    style={{ background: "rgba(236,220,176,0.75)", border: "1px solid #c8a860" }}>
                    {[
                      { label: "Fight", val: enemy.fightVal, color: "#c03028", hint: "Use Combat" },
                      { label: "Evade", val: enemy.evadeVal, color: "#c8871a", hint: "Use Agility" },
                      { label: "Deals", val: `${enemy.damage}💀 ${enemy.horror}🧠`, color: "#c8b090", hint: "Per attack" },
                      { label: "HP", val: `${hpLeft}/${enemy.health}`, color: hpPct > 50 ? "#3aad98" : hpPct > 25 ? "#d4922a" : "#c05050", hint: "Remaining" },
                    ].map(s => (
                      <div key={s.label} className="py-2 text-center" title={s.hint}>
                        <div className="text-[8px] font-mono text-ark-text-muted uppercase tracking-wide">{s.label}</div>
                        <div className="font-mono font-bold text-sm mt-0.5 leading-tight" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── Row 3: HP bar + damage controls (lead only) ── */}
                  <div className="mx-4 mb-3">
                    <div className="flex items-center gap-2">
                      {isLead && (
                        <button onClick={() => handleEnemyDamage(enemy.id, 1)}
                          className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-all"
                          style={{ background: "rgba(192,48,40,0.15)", border: "1px solid rgba(192,48,40,0.3)", color: "#c03028" }}>
                          + Hit
                        </button>
                      )}
                      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(236,220,176,0.8)" }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${hpPct}%`, background: hpPct > 50 ? "linear-gradient(90deg, #2a7048, #3aad98)" : hpPct > 25 ? "linear-gradient(90deg, #8a6010, #d4922a)" : "linear-gradient(90deg, #8e1a0e, #c05050)" }} />
                      </div>
                      {isLead && (
                        <button onClick={() => handleEnemyDamage(enemy.id, -1)}
                          className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-all"
                          style={{ background: "rgba(58,158,107,0.1)", border: "1px solid rgba(58,158,107,0.25)", color: "#3aad98" }}>
                          − Heal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── Row 4: Engagement (lead = interactive, others = read-only) ── */}
                  <div className="px-4 pb-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <p className="text-[9px] font-mono uppercase tracking-widest text-ark-text-muted mt-2 mb-1.5">
                      {isMassive ? "Engaged with (Massive)" : "Engaged with"}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {players.map(p => {
                        const inv = investigators.find(i => i.name === p.investigator);
                        const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                        const engaged = enemy.engagedPlayerIds.includes(p.id);
                        return isLead ? (
                          <button key={p.id} onClick={() => handleEnemyEngage(enemy.id, p.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                            style={engaged
                              ? { background: cls.bg, border: `2px solid ${cls.border}`, color: cls.hex, boxShadow: `0 0 8px ${cls.glow}` }
                              : { background: "rgba(236,220,176,0.75)", border: "1px solid rgba(138,104,32,0.2)", color: "#5a4838" }}>
                            {engaged ? "⚔ " : ""}{p.player_name}
                          </button>
                        ) : (
                          <span key={p.id} className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                            style={engaged
                              ? { background: cls.bg, border: `1px solid ${cls.border}`, color: cls.hex }
                              : { background: "rgba(236,220,176,0.55)", border: "1px solid rgba(138,104,32,0.2)", color: "#5a4838" }}>
                            {engaged ? "⚔ " : ""}{p.player_name}
                          </span>
                        );
                      })}
                      {enemy.engagedPlayerIds.length === 0 && (
                        <span className="text-[11px] text-ark-text-muted italic self-center">Unengaged</span>
                      )}
                    </div>

                    {/* ── Row 5: Exhaust toggle + Attack button (lead only) ── */}
                    {isLead && (
                      <div className="flex gap-2">
                        <button onClick={() => handleToggleExhaust(enemy.id)}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold font-decorative transition-all"
                          style={enemy.exhausted
                            ? { background: "rgba(58,173,152,0.12)", border: "1px solid rgba(58,173,152,0.3)", color: "#3aad98" }
                            : { background: "rgba(74,143,212,0.07)", border: "1px solid rgba(74,143,212,0.25)", color: "#4a8fd4" }}>
                          {enemy.exhausted ? "✓ Ready" : "Exhaust"}
                        </button>
                        {(() => {
                          const hasTargets = enemy.engagedPlayerIds.length > 0;
                          const isEnemyPhase = turnState.phase === "enemy";
                          return (
                            <button
                              onClick={() => handleEnemyAttack(enemy)}
                              disabled={!hasTargets || enemy.exhausted}
                              title={
                                enemy.exhausted ? "Exhausted enemies can't attack" :
                                !hasTargets ? "No one is engaged with this enemy" :
                                `Deal ${enemy.damage} damage + ${enemy.horror} horror to ${enemy.engagedPlayerIds.map(id => players.find(p => p.id === id)?.player_name ?? "?").join(", ")}`
                              }
                              className="flex-1 py-2 rounded-lg text-xs font-bold font-decorative transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              style={hasTargets && !enemy.exhausted
                                ? { background: isEnemyPhase ? "rgba(192,48,40,0.2)" : "rgba(192,48,40,0.1)", border: `1px solid ${isEnemyPhase ? "rgba(192,48,40,0.6)" : "rgba(192,48,40,0.3)"}`, color: "#c03028", boxShadow: isEnemyPhase ? "0 0 8px rgba(192,48,40,0.2)" : "none" }
                                : { background: "rgba(236,220,176,0.65)", border: "1px solid rgba(138,104,32,0.2)", color: "#5a4838" }}>
                              ⚔ Attacks!
                            </button>
                          );
                        })()}
                      </div>
                    )}
                    {/* ── What this enemy deals — reminder for non-lead too ── */}
                    {enemy.engagedPlayerIds.length > 0 && !isLead && (
                      <div className="mt-2 px-3 py-2 rounded-lg text-xs"
                        style={{ background: "rgba(192,48,40,0.07)", border: "1px solid rgba(192,48,40,0.2)", color: "#c8a890" }}>
                        ⚔ Deals <span style={{ color: "#c03028", fontWeight: "bold" }}>{enemy.damage} damage</span> + <span style={{ color: "#9070d8", fontWeight: "bold" }}>{enemy.horror} horror</span> per attack — lead applies it
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Keyword reference — collapsible, always available */}
            <details className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(138,104,32,0.25)" }}>
              <summary className="px-4 py-2.5 cursor-pointer text-xs font-mono text-ark-text-muted select-none"
                style={{ background: "rgba(236,220,176,0.8)" }}>
                ▸ Enemy keyword reference
              </summary>
              <div className="divide-y" style={{ borderColor: "rgba(138,104,32,0.2)", background: "rgba(236,220,176,0.8)" }}>
                {ENEMY_KEYWORDS.map(kw => (
                  <div key={kw.key} className="flex items-start gap-3 px-4 py-2.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold flex-shrink-0 mt-0.5"
                      style={{ background: `${kw.color}15`, color: kw.color }}>{kw.key}</span>
                    <p className="text-[11px] text-ark-text-muted leading-relaxed">{kw.desc}</p>
                  </div>
                ))}
              </div>
            </details>
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
              <div className="rounded-xl p-10 text-center" style={{ background: "rgba(236,220,176,0.7)", border: "1px dashed #c8a860" }}>
                <p className="text-ark-text-muted text-sm">No actions logged yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {actionLog.map(entry => {
                  const actionDef = ACTIONS.find(a => a.label === entry.action);
                  const phaseInfo = PHASES.find(p => p.id === entry.phase);
                  return (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-xl group" style={{ background: "rgba(236,220,176,0.85)", border: "1px solid rgba(138,104,32,0.2)" }}>
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
                        style={{ background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", color: "#c03028" }}
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
            <div className="rounded-xl p-4" style={{ background: "rgba(236,220,176,0.8)", border: "1px solid #c8a860" }}>
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
            <div className="rounded-xl p-4" style={{ background: "rgba(236,220,176,0.8)", border: "1px solid #c8a860" }}>
              <h3 className="font-decorative font-bold text-sm text-ark-text mb-3">Skill Icons</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { skill: "WIL", label: "Willpower", color: "#9070d8", desc: "Treacheries, Parley, horror" },
                  { skill: "INT", label: "Intellect",  color: "#4a8fd4", desc: "Investigate, clue tests" },
                  { skill: "COM", label: "Combat",     color: "#c03028", desc: "Fight tests, enemies" },
                  { skill: "AGI", label: "Agility",    color: "#3aad98", desc: "Evade tests, movement" },
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
            <div className="rounded-xl p-4" style={{ background: "rgba(236,220,176,0.8)", border: "1px solid #c8a860" }}>
              <h3 className="font-decorative font-bold text-sm text-ark-text mb-3">Token Types</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: () => <DoomIcon size={20} />, label: "Doom", color: "#9070d8", desc: "Counts toward Agenda threshold" },
                  { Icon: () => <ClueIcon size={20} />, label: "Clue", color: "#4a8fd4", desc: "Spend to advance Act deck" },
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
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #c8a860" }}>
              <div className="px-4 py-3" style={{ background: "rgba(236,220,176,0.8)", borderBottom: "1px solid #c8a860" }}>
                <h3 className="font-decorative font-bold text-sm text-ark-text">{turnState.campaignId && CAMPAIGNS.find(c => c.id === turnState.campaignId)?.name ? CAMPAIGNS.find(c => c.id === turnState.campaignId)!.name : "Standard"} Chaos Bag</h3>
                <p className="text-xs text-ark-text-muted">Standard difficulty</p>
              </div>
              <div className="p-4 flex flex-wrap gap-2" style={{ background: "rgba(236,220,176,0.75)" }}>
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
                    <p className="font-bold text-xs mb-1" style={{ color: "#c8871a" }}>{r.title}</p>
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
