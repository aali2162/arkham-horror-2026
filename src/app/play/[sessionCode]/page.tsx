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

  // Lead "Acting as" — lets the lead log actions on behalf of any player
  // null = logging for the actual current player (default); a player ID = logging for that specific player
  const [actingAsPlayerId, setActingAsPlayerId] = useState<string | null>(null);

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
    if (!selectedAction || !session) return;
    const ts = turnStateRef.current;

    // Determine which player this action is being logged for.
    // Lead can act as any player; otherwise fall back to the current turn player.
    const logForPlayer = actingAsPlayerId
      ? (players.find(p => p.id === actingAsPlayerId) ?? currentPlayer)
      : currentPlayer;
    if (!logForPlayer) return;

    const newActionsUsed = ts.actionsUsed + 1;

    const entry: ActionLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      playerName: logForPlayer.player_name,
      investigator: logForPlayer.investigator,
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
        <div className="d-page min-h-screen">
          <Navbar />
          <div className="d-topbar">
            <div>
              <span className="d-topbar-title">LOBBY</span>
              <span className="d-topbar-sub">AWAITING HOST</span>
            </div>
            <div className="d-phase-pill">
              <span className="live-dot" style={{ display: "inline-block", width: 6, height: 6, background: "#3aad98", borderRadius: "50%", marginRight: 6 }} />
              {sessionCode}
            </div>
          </div>
          <div style={{ padding: "40px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "3px", color: "#8a7040", marginBottom: 16 }}>WAITING FOR HOST TO START</div>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 22, color: "#1a1208", marginBottom: 8 }}>Gathering Investigators…</div>
            <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic", marginBottom: 32 }}>The investigation begins when the host starts the game.</div>
            {players.length > 0 && (
              <div style={{ background: "#fff", border: "2px solid #1a1208", textAlign: "left" }}>
                <div className="d-section-head"><span>IN THE LOBBY</span></div>
                {orderedLobbyPlayers.map((player) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderBottom: "1px solid #e8e0cc" }}>
                      <div style={{ width: 36, height: 36, background: cls.hex, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>{player.investigator[0]}</span>
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208" }}>{player.player_name}</div>
                        <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>{player.investigator}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: 24, fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "2px", color: "#3a2808" }}>
              SESSION CODE: <span style={{ color: "#c9a84c", fontWeight: 700 }}>{sessionCode}</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="d-page min-h-screen pb-12">
        <Navbar />

        {/* Top bar */}
        <div className="d-topbar">
          <div>
            <span className="d-topbar-title">GAME SETUP</span>
            <span className="d-topbar-sub">INVESTIGATOR&apos;S DOSSIER</span>
          </div>
          <div className="d-phase-pill">
            <span className="live-dot" style={{ display: "inline-block", width: 6, height: 6, background: "#3aad98", borderRadius: "50%", marginRight: 6 }} />
            LOBBY
          </div>
        </div>

        {/* Session code */}
        <div className="d-code-box">
          <span className="d-code-lbl">SESSION CODE — SHARE WITH YOUR PARTY</span>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
            <span className="d-code-val">{sessionCode}</span>
            <button onClick={handleCopyLink}
              style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 14px", background: "#1a1208", border: "2px solid #c9a84c", color: copied ? "#c9a84c" : "#f2e8cc", cursor: "pointer" }}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        <main style={{ maxWidth: 520, margin: "0 auto", padding: "0 0 40px" }}>

          {/* ── STEP 1: Investigators ── */}
          <div style={{ marginBottom: 2 }}>
            <div className="d-section-head" style={{ marginTop: 0 }}>
              <span>STEP 1 — ADD INVESTIGATORS</span>
              <span style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", fontWeight: 400 }}>{players.length} / 4</span>
            </div>

            {players.length === 0 ? (
              <div style={{ background: "#fff", padding: "24px 16px", textAlign: "center", borderBottom: "1px solid #e8e0cc" }}>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>No investigators yet. Add the first one below.</div>
              </div>
            ) : (
              <div>
                {orderedLobbyPlayers.map((player, idx) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <div key={player.id} className="d-player-card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px 12px 20px", borderBottom: "1px solid #e8e0cc" }}>
                      <div className="d-player-stripe" style={{ background: cls.hex }} />
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#c9a84c", width: 20, flexShrink: 0 }}>{idx + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="d-player-name-lbl">{player.player_name}</div>
                        <div className="d-player-inv-lbl">{player.investigator} · {inv?.class}</div>
                      </div>
                      <button onClick={() => handleRemove(player)}
                        style={{ width: 28, height: 28, background: "rgba(184,32,32,0.12)", border: "1px solid rgba(184,32,32,0.3)", color: "#b82020", fontFamily: "'Cinzel', serif", fontSize: 12, cursor: "pointer", flexShrink: 0 }}>
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
            <div style={{ marginBottom: 2 }}>
              <div className="d-section-head" style={{ background: lobbyOrderConfirmed ? "rgba(46,138,80,0.08)" : "#f5f0e8" }}>
                <span>STEP 2 — SET TURN ORDER</span>
                {lobbyOrderConfirmed && <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: "#2e8a50", fontWeight: 700, letterSpacing: "1px" }}>✓ CONFIRMED</span>}
              </div>
              <div>
                {orderedLobbyPlayers.map((player, idx) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  return (
                    <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px 10px 20px", background: "#fff", borderBottom: "1px solid #e8e0cc" }}>
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#c9a84c", width: 20, flexShrink: 0 }}>{idx + 1}</span>
                      <div style={{ width: 6, height: 32, background: cls.hex, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208", flex: 1 }}>{player.player_name}</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <button onClick={() => handleReorderPlayer(player.id, "up")}
                          disabled={orderedLobbyPlayers[0]?.id === player.id}
                          style={{ width: 24, height: 22, background: "#f5f0e8", border: "1px solid #1a1208", color: "#1a1208", fontFamily: "'Cinzel', serif", fontSize: 10, cursor: "pointer", opacity: orderedLobbyPlayers[0]?.id === player.id ? 0.25 : 1 }}>↑</button>
                        <button onClick={() => handleReorderPlayer(player.id, "down")}
                          disabled={orderedLobbyPlayers[orderedLobbyPlayers.length - 1]?.id === player.id}
                          style={{ width: 24, height: 22, background: "#f5f0e8", border: "1px solid #1a1208", color: "#1a1208", fontFamily: "'Cinzel', serif", fontSize: 10, cursor: "pointer", opacity: orderedLobbyPlayers[orderedLobbyPlayers.length - 1]?.id === player.id ? 0.25 : 1 }}>↓</button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => setLobbyOrderConfirmed(true)} className="d-btn-outline"
                style={{ background: lobbyOrderConfirmed ? "rgba(46,138,80,0.08)" : "#f5f0e8", color: lobbyOrderConfirmed ? "#2e8a50" : "#1a1208", borderColor: lobbyOrderConfirmed ? "#2e8a50" : "#1a1208" }}>
                {lobbyOrderConfirmed ? "✓ Turn Order Confirmed" : "Confirm Turn Order →"}
              </button>
            </div>
          )}

          {/* ── STEP 3: Lead Investigator ── */}
          {players.length >= 1 && (
            <div style={{ marginBottom: 2 }}>
              <div className="d-section-head" style={{ background: lobbyLeadConfirmed ? "rgba(201,168,76,0.10)" : "#f5f0e8" }}>
                <span>STEP {players.length >= 2 ? "3" : "2"} — CHOOSE LEAD INVESTIGATOR</span>
                {lobbyLeadConfirmed && <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: "#c9a84c", fontWeight: 700, letterSpacing: "1px" }}>✓ CONFIRMED</span>}
              </div>
              <div style={{ background: "#f9f5ee", padding: "10px 16px", borderBottom: "1px solid #e8e0cc" }}>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>The Lead Investigator manages Mythos, Enemy, and Upkeep phases for the group.</div>
              </div>
              <div>
                {orderedLobbyPlayers.map((player, idx) => {
                  const inv = investigators.find(i => i.name === player.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  const isSelected = lobbyLeadIdx === idx;
                  return (
                    <button key={player.id} onClick={() => { setLobbyLeadIdx(idx); setLobbyLeadConfirmed(false); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "12px 16px 12px 20px", background: isSelected ? "#fff8e8" : "#fff", border: "none", borderBottom: "1px solid #e8e0cc", cursor: "pointer", textAlign: "left", borderLeft: isSelected ? `5px solid ${cls.hex}` : "5px solid transparent" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208" }}>{player.player_name}</div>
                        <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>{player.investigator}</div>
                      </div>
                      {isSelected && (
                        <div className="d-badge d-badge-lead">★ LEAD</div>
                      )}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => setLobbyLeadConfirmed(true)} className="d-btn-outline"
                style={{ background: lobbyLeadConfirmed ? "rgba(201,168,76,0.10)" : "#f5f0e8", color: lobbyLeadConfirmed ? "#c9a84c" : "#1a1208", borderColor: lobbyLeadConfirmed ? "#c9a84c" : "#1a1208" }}>
                {lobbyLeadConfirmed ? "✓ Lead Confirmed" : "Confirm Lead Investigator →"}
              </button>
            </div>
          )}

          {/* Add player form */}
          {players.length < 4 && (
            <div style={{ marginBottom: 2 }}>
              <div className="d-section-head">
                <span>{players.length === 0 ? "ADD FIRST INVESTIGATOR" : "ADD ANOTHER INVESTIGATOR"}</span>
              </div>
              <div style={{ padding: "16px", background: "#fff", borderBottom: "1px solid #e8e0cc", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={addingName} onChange={e => setAddingName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddPlayer()}
                placeholder="Player name"
                className="d-input" />
              <select value={addingInvestigator} onChange={e => setAddingInvestigator(e.target.value)} className="d-select">
                {investigators.map(inv => <option key={inv.name} value={inv.name}>{inv.name} ({inv.class})</option>)}
              </select>
              {/* Investigator stat preview */}
              {(() => {
                const selInv = investigators.find(i => i.name === addingInvestigator);
                if (!selInv) return null;
                const cls = CLASS_COLORS[selInv.class ?? "Guardian"];
                return (
                  <div className="rounded-lg p-2.5 grid grid-cols-6 gap-1.5 text-center" style={{ background: cls.bg, border: `1px solid ${cls.border}` }}>
                    {/* HP + SAN with text labels */}
                    {[
                      { label: "HP",  val: selInv.health, color: "#c03028" },
                      { label: "SAN", val: selInv.sanity, color: "#9070d8" },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="text-[9px] font-mono text-ark-text-muted">{s.label}</div>
                        <div className="font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                    {/* Skill stats — icon only */}
                    {[
                      { skill: "WIL", val: selInv.willpower, color: "#9070d8", title: "Willpower" },
                      { skill: "INT", val: selInv.intellect, color: "#c8871a", title: "Intellect" },
                      { skill: "COM", val: selInv.combat,    color: "#c03028", title: "Combat"    },
                      { skill: "AGI", val: selInv.agility,   color: "#3aad98", title: "Agility"   },
                    ].map(s => (
                      <div key={s.skill} title={s.title}>
                        <div className="flex justify-center mb-0.5"><SkillIcon skill={s.skill} size={12} /></div>
                        <div className="font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
              <button onClick={handleAddPlayer} disabled={addingPlayer || !addingName.trim()} className="d-btn-ink">
                {addingPlayer ? "Adding…" : "+ ADD TO LOBBY"}
              </button>
              </div>
            </div>
          )}

          {players.length >= 4 && (
            <div style={{ padding: "14px 16px", background: "#fff8e8", borderBottom: "1px solid #e8e0cc", fontFamily: "'Cinzel', serif", fontSize: 11, color: "#c9a84c", letterSpacing: "2px", textAlign: "center" }}>
              MAXIMUM 4 INVESTIGATORS REACHED
            </div>
          )}

          {/* ── START GAME ── */}
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
              <div style={{ padding: "20px 16px 0" }}>
                <button onClick={handleStartGame} disabled={!ready}
                  className={ready ? "d-btn-gold" : "d-btn-outline"}
                  style={{ opacity: ready ? 1 : 0.4 }}>
                  {ready ? `▶ START GAME — ${players.length} INVESTIGATOR${players.length !== 1 ? "S" : ""}` : "START GAME"}
                </button>
                {blockReason && (
                  <div style={{ marginTop: 10, fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#b82020", fontStyle: "italic", textAlign: "center" }}>⚠ {blockReason}</div>
                )}
                {ready && <div style={{ marginTop: 8, fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic", textAlign: "center" }}>Round 1 skips the Mythos Phase — first investigator goes immediately.</div>}
              </div>
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
                      {/* HP + SAN with text labels */}
                      {[
                        { label: "HP",  val: selInv.health, color: "#c03028" },
                        { label: "SAN", val: selInv.sanity, color: "#9070d8" },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="text-[9px] font-mono text-ark-text-muted">{s.label}</div>
                          <div className="font-bold text-sm" style={{ color: s.color }}>{s.val}</div>
                        </div>
                      ))}
                      {/* Skill stats — icon only */}
                      {[
                        { skill: "WIL", val: selInv.willpower, color: "#9070d8", title: "Willpower" },
                        { skill: "INT", val: selInv.intellect, color: "#c8871a", title: "Intellect" },
                        { skill: "COM", val: selInv.combat,    color: "#c03028", title: "Combat"    },
                        { skill: "AGI", val: selInv.agility,   color: "#3aad98", title: "Agility"   },
                      ].map(s => (
                        <div key={s.skill} title={s.title}>
                          <div className="flex justify-center mb-0.5"><SkillIcon skill={s.skill} size={12} /></div>
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
      <div className="d-page min-h-screen pb-24">
        <Navbar />

        {/* ── Option D Hero header ── */}
        <div className="d-topbar" style={{ paddingBottom: 16 }}>
          <div>
            <div className="d-hero-eyebrow">IT&apos;S YOUR TURN</div>
            <div className="d-hero-name">{currentPlayer.player_name}</div>
            <div className="d-hero-role">{currentPlayer.investigator}{inv ? ` · ${inv.class}` : ""}</div>
          </div>
          <div>
            <div className="d-phase-pill" style={{ marginBottom: 6 }}>{currentPhase.label} Phase</div>
            <div className="d-round-badge" style={{ textAlign: "right" }}>RND {turnState.round}</div>
          </div>
        </div>

        {/* ── Dark stat strip ── */}
        {myPlayer && inv && (
          <div className="d-stat-strip" style={{ justifyContent: "space-around" }}>
            <div className="d-stat-cell" style={{ borderTopColor: "#ff6050" }}>
              <span className="d-stat-val" style={{ color: "#ff6050" }}>{myPlayer.damage}</span>
              <span className="d-stat-lbl">DMG</span>
              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4 }}>
                <button onClick={() => handleStatChange(myPlayer, "damage", -1)} className="d-adj-btn">−</button>
                <button onClick={() => handleStatChange(myPlayer, "damage", 1)} className="d-adj-btn">+</button>
              </div>
            </div>
            <div className="d-stat-cell" style={{ borderTopColor: "#c090ff" }}>
              <span className="d-stat-val" style={{ color: "#c090ff" }}>{myPlayer.horror}</span>
              <span className="d-stat-lbl">HOR</span>
              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4 }}>
                <button onClick={() => handleStatChange(myPlayer, "horror", -1)} className="d-adj-btn">−</button>
                <button onClick={() => handleStatChange(myPlayer, "horror", 1)} className="d-adj-btn">+</button>
              </div>
            </div>
            <div className="d-stat-cell" style={{ borderTopColor: "#f0c060" }}>
              <span className="d-stat-val" style={{ color: "#f0c060" }}>{myPlayer.resources}</span>
              <span className="d-stat-lbl">RES</span>
              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4 }}>
                <button onClick={() => handleStatChange(myPlayer, "resources", -1)} className="d-adj-btn">−</button>
                <button onClick={() => handleStatChange(myPlayer, "resources", 1)} className="d-adj-btn">+</button>
              </div>
            </div>
            <div className="d-stat-cell" style={{ borderTopColor: "#60e090" }}>
              <span className="d-stat-val" style={{ color: "#60e090" }}>{myPlayer.clues}</span>
              <span className="d-stat-lbl">CLUES</span>
              <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4 }}>
                <button onClick={() => handleStatChange(myPlayer, "clues", -1)} className="d-adj-btn">−</button>
                <button onClick={() => handleStatChange(myPlayer, "clues", 1)} className="d-adj-btn">+</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Actions remaining counter ── */}
        <div className="d-section-head">
          <span>CHOOSE AN ACTION</span>
          <span style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", fontWeight: 400 }}>{actionsLeft} of 3 remaining</span>
        </div>

        {/* ── Action list ── */}
        <div>
          {ACTIONS.map(action => (
            <div key={action.id} className="d-action-row" onClick={() => setSelectedAction(action)}>
              <div className="d-action-icon-wrap">
                {action.skill ? <SkillIcon skill={action.skill} size={22} /> : <ActionSymbol size={22} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="d-action-trigger">► ACTION</span>
                <span className="d-action-name">{action.label}</span>
                <span className="d-action-desc">{action.desc}</span>
                {action.skill && (
                  <span className="d-skill-pill" style={{ color: ACTIONS.find(a => a.id === action.id)?.color, borderColor: ACTIONS.find(a => a.id === action.id)?.color }}>
                    {action.skill}
                  </span>
                )}
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: 0.35 }}>
                <path d="M6 4l4 4-4 4" stroke="#1a1208" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="d-bottom-bar">
          <button onClick={() => setViewBoardMode(true)} className="d-bottom-board">
            ◎ BOARD
          </button>
          <button onClick={handleUndoLastAction}
            disabled={actionLog.length === 0 || actionLog.every(e => e.action === "Undo" || e.action === "Log Cleared")}
            className="d-bottom-board"
            style={{ borderRight: "2px solid #c9a84c", opacity: actionLog.length === 0 ? 0.4 : 1 }}>
            ↩ UNDO
          </button>
          <button onClick={handleEndTurn} className="d-bottom-endturn">
            END TURN →
          </button>
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
      <main className="d-page" style={{ paddingBottom: 80 }}>

        {/* ── Option D top bar ── */}
        <div className="d-topbar">
          <div>
            <span className="d-topbar-title">{sessionCode}</span>
            <span className="d-topbar-sub">ROUND {turnState.round} · {currentPhase.label.toUpperCase()} PHASE</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
            <div className="d-phase-pill" style={{ borderColor: `${currentPhase.color}60` }}>{currentPhase.label.toUpperCase()}</div>
            <div className="d-round-badge">
              <span style={{ color: doomDanger ? "#ff6060" : "#c9a84c" }}>
                ☠ {turnState.doom}/{turnState.doomThreshold}
              </span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 540, margin: "0 auto" }}>

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
          <div style={{ background: "#1a1208", borderBottom: "2px solid #c9a84c", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: "#c9a84c", letterSpacing: "1px" }}>
              ⚡ YOUR TURN — {3 - turnState.actionsUsed} ACTION{3 - turnState.actionsUsed !== 1 ? "S" : ""} LEFT
            </span>
            <button onClick={() => setViewBoardMode(false)}
              style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 16px", background: "#c9a84c", border: "none", color: "#1a1208", cursor: "pointer" }}>
              ← YOUR TURN
            </button>
          </div>
        )}

        {/* ── Identity / utility bar ── */}
        <div style={{ background: "#f5f0e8", borderBottom: "1px solid #d8d0b8", padding: "8px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {myPlayer ? (
              <button onClick={() => setShowNamePicker(true)}
                style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, color: "#1a1208", background: "none", border: "1px solid #1a1208", padding: "4px 10px", cursor: "pointer" }}>
                👤 {myPlayer.player_name}
              </button>
            ) : (
              <button onClick={() => setShowNamePicker(true)}
                style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, color: "#c9a84c", background: "none", border: "2px solid #c9a84c", padding: "4px 10px", cursor: "pointer", animation: "pulse 2s infinite" }}>
                👤 IDENTIFY ME
              </button>
            )}
            {isLead && (
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "3px 8px", background: "#c9a84c", color: "#1a1208" }}>★ LEAD</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isLead && showRoundEdit ? (
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input type="number" min="1" value={roundEditValue} onChange={e => setRoundEditValue(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleFixRound(parseInt(roundEditValue)); if (e.key === "Escape") setShowRoundEdit(false); }}
                  className="d-input" style={{ width: 60, padding: "4px 8px", fontSize: 14 }} autoFocus />
                <button onClick={() => handleFixRound(parseInt(roundEditValue))} style={{ background: "#2e8a50", border: "none", color: "#fff", padding: "4px 8px", fontFamily: "'Cinzel', serif", fontSize: 11, cursor: "pointer" }}>✓</button>
                <button onClick={() => setShowRoundEdit(false)} style={{ background: "#b82020", border: "none", color: "#fff", padding: "4px 8px", fontFamily: "'Cinzel', serif", fontSize: 11, cursor: "pointer" }}>✕</button>
              </div>
            ) : (
              <button onClick={() => { if (isLead) { setRoundEditValue(String(turnState.round)); setShowRoundEdit(true); } }}
                style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: "#3a2808", background: "none", border: "none", cursor: isLead ? "pointer" : "default" }}>
                RND {turnState.round}{isLead && " ✏"}
              </button>
            )}
            <span style={{ color: "#c0b890", fontSize: 12 }}>·</span>
            <button onClick={handleCopyLink}
              style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: copied ? "#2e8a50" : "#c9a84c", background: "none", border: "none", cursor: "pointer", letterSpacing: "1px" }}>
              {copied ? "✓ COPIED" : "SHARE"}
            </button>
          </div>
        </div>

        {/* ── Not identified banner ── */}
        {!myPlayer && (
          <div onClick={() => setShowNamePicker(true)} style={{ background: "#fff8e8", borderBottom: "2px solid #c9a84c", padding: "12px 16px", cursor: "pointer", textAlign: "center" }}>
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: "#c9a84c", letterSpacing: "2px" }}>TAP TO IDENTIFY YOURSELF →</span>
          </div>
        )}

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

        {/* ══ DOOM & ACT STATUS BAR ══ */}
        <div style={{ marginBottom: 2 }}>

          {/* ── Doom strip ── */}
          <div className="d-doom-strip" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "2px solid #c9a84c" }}>
            {/* AGENDA side */}
            <div style={{ padding: "12px 14px", borderRight: "1px solid rgba(201,168,76,0.3)" }}>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: doomDanger ? "#ff6050" : "#c9a84c", marginBottom: 4 }}>
                AGENDA {doomDanger && <span style={{ color: "#ff6050" }}>— ADVANCE!</span>}
              </div>
              <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#f2e8cc", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {turnState.agendaName || "—"}
              </div>
              {/* Doom pips */}
              <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                {Array.from({ length: turnState.doomThreshold }).map((_, i) => {
                  const filled = i < turnState.doom;
                  return (
                    <button key={i}
                      onClick={() => isLead && pushTurnState({ ...turnState, doom: i < turnState.doom ? i : i + 1 })}
                      disabled={!isLead}
                      style={{ width: 18, height: 18, border: `2px solid ${filled ? (doomDanger ? "#ff6050" : "#9070d8") : "rgba(242,232,204,0.3)"}`, background: filled ? (doomDanger ? "rgba(255,96,80,0.3)" : "rgba(112,80,184,0.3)") : "transparent", cursor: isLead ? "pointer" : "default", padding: 0 }}>
                    </button>
                  );
                })}
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: doomDanger ? "#ff6050" : "#c9a84c", marginLeft: 4 }}>
                  {turnState.doom}/{turnState.doomThreshold}
                </span>
              </div>
            </div>

            {/* ACT side */}
            {(() => {
              const cluesOnAct = turnState.cluesOnAct ?? 0;
              const needed = turnState.cluesRequired ?? 0;
              const canAdvance = needed === 0 || cluesOnAct >= needed;
              const myClues = myPlayer?.clues ?? 0;
              const handlePipTap = async (i: number) => {
                if (i < cluesOnAct) {
                  if (!myPlayer) return;
                  await updatePlayerStat(myPlayer.id, "clues", myPlayer.clues + 1);
                  await pushTurnState({ ...turnState, cluesOnAct: cluesOnAct - 1 });
                } else {
                  if (!myPlayer || myPlayer.clues < 1) return;
                  await updatePlayerStat(myPlayer.id, "clues", myPlayer.clues - 1);
                  await pushTurnState({ ...turnState, cluesOnAct: cluesOnAct + 1 });
                }
              };
              return (
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: canAdvance ? "#60e090" : "#c9a84c", marginBottom: 4 }}>
                    ACT {canAdvance && needed > 0 && <span style={{ color: "#60e090" }}>— READY!</span>}
                  </div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#f2e8cc", marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {turnState.actName || "—"}
                  </div>
                  {needed > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                      {Array.from({ length: needed }).map((_, i) => {
                        const filled = i < cluesOnAct;
                        const canFill = !filled && myClues > 0;
                        return (
                          <button key={i}
                            onClick={() => handlePipTap(i)}
                            disabled={!filled && myClues < 1}
                            title={filled ? "Tap to take back" : canFill ? "Tap to spend a clue" : "No clues in hand"}
                            style={{ width: 18, height: 18, border: `2px solid ${filled ? "#4a8fd4" : "rgba(242,232,204,0.3)"}`, background: filled ? "rgba(74,143,212,0.4)" : "transparent", cursor: (filled || canFill) ? "pointer" : "default", padding: 0 }}>
                          </button>
                        );
                      })}
                      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: canAdvance ? "#60e090" : "#4a8fd4", marginLeft: 4 }}>
                        {cluesOnAct}/{needed}
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Lead action bar */}
          {isLead && (
            <div style={{ background: "#2a1a06", borderBottom: "1px solid rgba(201,168,76,0.3)", padding: "8px 14px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={() => setShowCampaignPicker(true)}
                style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: "transparent", border: "1px solid rgba(201,168,76,0.5)", color: "#c9a84c", cursor: "pointer" }}>
                SCENARIO
              </button>
              {(() => {
                const _cluesOnAct = turnState.cluesOnAct ?? 0;
                const _needed = turnState.cluesRequired ?? 0;
                const _canAdvance = _needed === 0 || _cluesOnAct >= _needed;
                return (
                  <button onClick={handleAdvanceAct} disabled={!_canAdvance}
                    style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: _canAdvance ? "rgba(74,143,212,0.2)" : "transparent", border: `1px solid ${_canAdvance ? "#4a8fd4" : "rgba(74,143,212,0.3)"}`, color: _canAdvance ? "#4a8fd4" : "rgba(74,143,212,0.4)", cursor: _canAdvance ? "pointer" : "default" }}>
                    ADVANCE ACT →
                  </button>
                );
              })()}
              {turnState.campaignId && turnState.campaignId !== "custom" && (
                <button onClick={handleAdvanceScenario}
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: "transparent", border: "1px solid rgba(46,138,80,0.5)", color: "#2e8a50", cursor: "pointer" }}>
                  NEXT SCENARIO ↗
                </button>
              )}
              <button onClick={() => setShowEndScenario(true)}
                style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: "transparent", border: "1px solid rgba(184,32,32,0.5)", color: "#b82020", cursor: "pointer", marginLeft: "auto" }}>
                END SCENARIO
              </button>
            </div>
          )}
        </div>

        {/* ── End Scenario modal ── */}
        {showEndScenario && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.88)" }}>
            <div style={{ width: "100%", maxWidth: 400, background: "#f5f0e8", border: "2px solid #1a1208", borderTop: "5px solid #b82020" }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: "2px solid #1a1208" }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, fontWeight: 700, color: "#1a1208", marginBottom: 6 }}>End Scenario</div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>This will lock the session and show the summary to all players.</div>
              </div>
              <div style={{ padding: "16px 20px" }}>
                <label style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", display: "block", marginBottom: 8 }}>HOW DID IT END? (OPTIONAL)</label>
                <input value={scenarioResolutionText} onChange={e => setScenarioResolutionText(e.target.value)}
                  placeholder="e.g. Victory — Cultist defeated, 3 trauma taken"
                  className="d-input" style={{ width: "100%", marginBottom: 16, boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowEndScenario(false)} className="d-btn-outline" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={handleEndScenario} style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, letterSpacing: "1px", padding: "12px 16px", background: "#b82020", border: "2px solid #1a1208", color: "#f2e8cc", cursor: "pointer" }}>
                    END SCENARIO
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Scenario Summary screen ── */}
        {showScenarioSummary && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.92)" }}>
            <div style={{ width: "100%", maxWidth: 480, background: "#f5f0e8", border: "2px solid #1a1208", borderTop: "5px solid #c9a84c", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 20px 16px", borderBottom: "2px solid #1a1208", flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 18, fontWeight: 700, color: "#1a1208", marginBottom: 4 }}>Scenario Complete</div>
                {turnState.scenarioResolution && <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#c9a84c", fontStyle: "italic" }}>{turnState.scenarioResolution}</div>}
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, color: "#8a7040", letterSpacing: "2px", marginTop: 4 }}>ROUND {turnState.round} · {players.length} INVESTIGATOR{players.length !== 1 ? "S" : ""}</div>
              </div>
              <div style={{ overflowY: "auto", flex: 1, padding: "16px 16px" }}>
                {players.map(p => {
                  const inv = investigators.find(i => i.name === p.investigator);
                  const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
                  const isDefeated = p.damage >= (inv?.health ?? 9);
                  const isInsane = p.horror >= (inv?.sanity ?? 7);
                  return (
                    <div key={p.id} className="d-player-card" style={{ borderLeft: `5px solid ${cls.hex}`, marginBottom: 8 }}>
                      <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: "#1a1208", border: `2px solid ${cls.hex}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: cls.hex, flexShrink: 0 }}>{p.investigator[0]}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208" }}>{p.player_name}</div>
                          <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>{p.investigator}{inv ? ` · ${inv.class}` : ""}</div>
                        </div>
                        {(isDefeated || isInsane) && (
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "3px 8px", background: isDefeated ? "#b82020" : "#6a40b8", color: "#f2e8cc" }}>
                            {isDefeated ? "DEFEATED" : "INSANE"}
                          </span>
                        )}
                      </div>
                      <div className="d-stat-strip" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                        {[
                          { label: "DMG", val: `${p.damage}/${inv?.health ?? 9}`, color: "#ff6050" },
                          { label: "HOR", val: `${p.horror}/${inv?.sanity ?? 7}`, color: "#c090ff" },
                          { label: "RES", val: p.resources, color: "#f0c060" },
                          { label: "CLUES", val: p.clues, color: "#60e090" },
                        ].map((s, i) => (
                          <div key={s.label} style={{ padding: "8px 6px", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(201,168,76,0.2)" : "none" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.val}</div>
                            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase" }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div style={{ background: "#fff", border: "2px solid #1a1208", padding: "12px 14px", marginTop: 8 }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", marginBottom: 4 }}>{actionLog.length} ACTIONS LOGGED</div>
                  {actionLog.filter(e => e.action === "Enemy Defeated").length > 0 && (
                    <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>Enemies defeated: {actionLog.filter(e => e.action === "Enemy Defeated").map(e => e.detail.split(" defeated")[0]).join(", ")}</div>
                  )}
                </div>
              </div>
              <div style={{ padding: "16px 16px", borderTop: "2px solid #1a1208", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                {isLead && (
                  <button onClick={() => { setShowScenarioSummary(false); setShowCarryOverModal(true); }} className="d-btn-gold" style={{ width: "100%" }}>
                    CONTINUE TO NEXT SCENARIO →
                  </button>
                )}
                <button onClick={() => setShowScenarioSummary(false)} className="d-btn-outline" style={{ width: "100%" }}>Close Summary</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Carry-Over modal ── */}
        {showCarryOverModal && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.88)" }}>
            <div style={{ width: "100%", maxWidth: 400, background: "#f5f0e8", border: "2px solid #1a1208", borderTop: "5px solid #2e8a50" }}>
              <div style={{ padding: "20px 20px 12px", borderBottom: "2px solid #1a1208" }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, fontWeight: 700, color: "#1a1208", marginBottom: 4 }}>Next Session Carry-Over</div>
                <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>Remind your group which resources carry over between scenarios.</div>
              </div>
              <div style={{ padding: "12px 16px" }}>
                {[
                  { label: "XP (experience points)", carries: true, note: "Spend between scenarios on upgrades" },
                  { label: "Trauma (physical + mental)", carries: true, note: "Reduces max HP/Sanity permanently" },
                  { label: "Resources & Clues", carries: false, note: "Reset to starting values each scenario" },
                  { label: "Damage & Horror", carries: false, note: "Healed between scenarios unless defeated" },
                  { label: "Cards in hand & deck", carries: true, note: "Keep your deck; some may be lost via trauma" },
                  { label: "Earned campaign items", carries: true, note: "Story items and campaign log entries carry over" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: "1px solid #e8e0cc" }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: item.carries ? "#2e8a50" : "#b82020", flexShrink: 0, width: 16, textAlign: "center" }}>{item.carries ? "✓" : "✗"}</span>
                    <div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: "#1a1208" }}>{item.label}</div>
                      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 16px", borderTop: "2px solid #1a1208", display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => { setShowCarryOverModal(false); handleAdvanceScenario(); }} className="d-btn-gold" style={{ width: "100%" }}>
                  GOT IT — ADVANCE TO NEXT SCENARIO
                </button>
                <button onClick={() => setShowCarryOverModal(false)} className="d-btn-outline" style={{ width: "100%" }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Campaign picker modal ── */}
        {showCampaignPicker && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.88)" }}>
            <div style={{ width: "100%", maxWidth: 440, background: "#f5f0e8", border: "2px solid #1a1208", borderTop: "5px solid #9070d8", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "20px 20px 12px", borderBottom: "2px solid #1a1208", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, fontWeight: 700, color: "#1a1208" }}>
                  {selectedCampaignId === null ? "Select Campaign & Scenario" : selectedCampaignId === "custom" ? "Custom Scenario" : CAMPAIGNS.find(c => c.id === selectedCampaignId)?.name ?? "Select Scenario"}
                </div>
                <button onClick={() => { setShowCampaignPicker(false); setSelectedCampaignId(null); }}
                  style={{ width: 28, height: 28, background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", fontFamily: "'Cinzel', serif", fontSize: 12, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ overflowY: "auto", flex: 1, padding: "12px 16px" }}>
                {selectedCampaignId === null ? (
                  <div>
                    {CAMPAIGNS.map(campaign => (
                      <button key={campaign.id} onClick={() => setSelectedCampaignId(campaign.id)}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 14px", background: "#fff", border: "none", borderBottom: "2px solid #e8e0cc", textAlign: "left", cursor: "pointer" }}>
                        <div>
                          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208" }}>{campaign.name}</div>
                          <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>{campaign.subtitle}</div>
                        </div>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, color: "#c9a84c" }}>→</span>
                      </button>
                    ))}
                  </div>
                ) : selectedCampaignId === "custom" ? (
                  <div>
                    <button onClick={() => setSelectedCampaignId(null)}
                      style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", cursor: "pointer", marginBottom: 12 }}>
                      ← BACK
                    </button>
                    <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic", marginBottom: 16 }}>Fill in the details for your custom scenario. Only the Scenario Name is required.</div>
                    {[
                      { label: "Campaign Name (optional)", value: customCampaignName, setter: setCustomCampaignName, placeholder: "e.g. The Dunwich Legacy" },
                      { label: "Scenario Name *", value: customScenarioName, setter: setCustomScenarioName, placeholder: "e.g. Extracurricular Activity" },
                      { label: "Agenda Name (optional)", value: customAgendaName, setter: setCustomAgendaName, placeholder: "e.g. Something Stirs…" },
                      { label: "Act Name (optional)", value: customActName, setter: setCustomActName, placeholder: "e.g. Investigating the Campus" },
                    ].map(f => (
                      <div key={f.label} style={{ marginBottom: 10 }}>
                        <label style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", display: "block", marginBottom: 6 }}>{f.label.toUpperCase()}</label>
                        <input value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder} className="d-input" style={{ width: "100%", boxSizing: "border-box" }} />
                      </div>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                      <div style={{ background: "#fff", border: "2px solid #1a1208", padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", marginBottom: 8 }}>DOOM THRESHOLD</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <button onClick={() => setCustomDoomThreshold(v => Math.max(1, v - 1))} className="d-adj-btn">−</button>
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: "#1a1208" }}>{customDoomThreshold}</span>
                          <button onClick={() => setCustomDoomThreshold(v => v + 1)} className="d-adj-btn">+</button>
                        </div>
                      </div>
                      <div style={{ background: "#fff", border: "2px solid #1a1208", padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", marginBottom: 8 }}>CLUES REQUIRED</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <button onClick={() => setCustomCluesRequired(v => Math.max(0, v - 1))} className="d-adj-btn">−</button>
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: "#1a1208" }}>{customCluesRequired}</span>
                          <button onClick={() => setCustomCluesRequired(v => v + 1)} className="d-adj-btn">+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleSelectCustomScenario} disabled={!customScenarioName.trim()} className="d-btn-ink" style={{ width: "100%", opacity: !customScenarioName.trim() ? 0.4 : 1 }}>
                      BEGIN THIS SCENARIO
                    </button>
                  </div>
                ) : (
                  <div>
                    <button onClick={() => setSelectedCampaignId(null)}
                      style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", cursor: "pointer", marginBottom: 12 }}>
                      ← BACK
                    </button>
                    {(() => {
                      const campaign = CAMPAIGNS.find(c => c.id === selectedCampaignId);
                      return campaign?.scenarios.map((scenario, idx) => (
                        <button key={scenario.id} onClick={() => handleSelectScenario(selectedCampaignId, scenario.id)}
                          style={{ width: "100%", display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: "#fff", border: "none", borderBottom: "2px solid #e8e0cc", textAlign: "left", cursor: "pointer" }}>
                          <div style={{ width: 24, height: 24, background: "#1a1208", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: "#c9a84c", flexShrink: 0 }}>{idx + 1}</div>
                          <div>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208" }}>{scenario.name}</div>
                            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>{scenario.agendaName} · Doom {scenario.doomThreshold} · {scenario.cluesRequired} clues</div>
                          </div>
                        </button>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Phase banner (non-investigation) ── */}
        {turnState.phase !== "investigation" && (
          <div style={{ background: "#fff", border: "none", borderBottom: "2px solid #e8e0cc", marginBottom: 2 }}>
            <div style={{ height: 4, background: currentPhase.color }} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#3a2808", marginBottom: 6 }}>
                    {currentPhase.label.toUpperCase()} PHASE · ROUND {turnState.round}
                  </div>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "#1a1208", marginBottom: 4 }}>
                    {currentPhase.label} Phase
                  </div>
                  <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", lineHeight: 1.5 }}>
                    {currentPhase.desc}
                  </div>
                </div>
                {isLead && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                    {turnState.phase === "mythos" && (
                      <button onClick={async () => { await handleLeadPhaseAction("Doom Placed", `Placed 1 doom — now ${turnState.doom + 1}/${turnState.doomThreshold}`); pushTurnState({ ...turnState, doom: turnState.doom + 1 }); }}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 12px", background: "#1a1208", border: "2px solid #9070d8", color: "#9070d8", cursor: "pointer" }}>
                        + PLACE DOOM
                      </button>
                    )}
                    {turnState.phase === "mythos" && (
                      <button onClick={() => handleLeadPhaseAction("Encounter Cards Drawn", "All investigators drew encounter cards")}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 12px", background: "transparent", border: "2px solid #9070d8", color: "#1a1208", cursor: "pointer" }}>
                        LOG ENCOUNTER
                      </button>
                    )}
                    {turnState.phase === "enemy" && (
                      <button onClick={() => handleLeadPhaseAction("Hunter Enemies Moved", "Hunter enemies moved toward nearest investigator")}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 12px", background: "transparent", border: "2px solid #b82020", color: "#1a1208", cursor: "pointer" }}>
                        LOG HUNTER MOVE
                      </button>
                    )}
                    {turnState.phase === "enemy" && (
                      <button onClick={() => handleLeadPhaseAction("Enemies Attacked", "All engaged ready enemies attacked")}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 12px", background: "transparent", border: "2px solid #b82020", color: "#1a1208", cursor: "pointer" }}>
                        LOG ATTACKS
                      </button>
                    )}
                    {turnState.phase === "upkeep" && enemies.some(e => e.exhausted) && (
                      <button onClick={handleReadyAllEnemies}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 12px", background: "transparent", border: "2px solid #2e8a50", color: "#1a1208", cursor: "pointer" }}>
                        READY ENEMIES
                      </button>
                    )}
                    {turnState.phase === "upkeep" && (
                      <button onClick={() => handleLeadPhaseAction("Upkeep Resolved", "All cards readied, each investigator drew 1 card and gained 1 resource")}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 12px", background: "transparent", border: "2px solid #2e8a50", color: "#1a1208", cursor: "pointer" }}>
                        LOG UPKEEP
                      </button>
                    )}
                    <button onClick={handleAdvancePhase}
                      className="d-btn-gold"
                      style={{ fontSize: 11, letterSpacing: "1px", padding: "8px 12px" }}>
                      ADVANCE → {PHASES[(PHASES.findIndex(p=>p.id===turnState.phase)+1)%4].label.toUpperCase()}
                    </button>
                  </div>
                )}
              </div>
              {!isLead && (
                <div style={{ marginTop: 8, fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>
                  {leadPlayer?.player_name ?? "Lead"} is managing this phase.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Active turn indicator ── */}
        {turnState.phase === "investigation" && currentPlayer && !isMyTurn && (
          <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", marginBottom: 2 }}>
            {(() => {
              const inv = investigators.find(i => i.name === currentPlayer.investigator);
              const cls = CLASS_COLORS[inv?.class ?? "Guardian"];
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderLeft: `5px solid ${cls.hex}` }}>
                  <div style={{ width: 40, height: 40, background: "#1a1208", border: `2px solid ${cls.hex}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: cls.hex }}>
                    {currentPlayer.investigator[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "#1a1208" }}>{currentPlayer.player_name}</div>
                    <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>Taking their turn…</div>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 20, height: 20, border: `2px solid ${i < (3 - turnState.actionsUsed) ? cls.hex : "#e8e0cc"}`, background: i < (3 - turnState.actionsUsed) ? "#1a1208" : "transparent" }} />
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* Recent actions from current player */}
            {(() => {
              const recentActions = actionLog
                .filter(e => e.playerName === currentPlayer.player_name && e.round === turnState.round && e.action !== "End Turn" && e.action !== "Enemy Spawned" && e.action !== "Enemy Attack" && e.action !== "Enemy Defeated")
                .slice(0, 3);
              if (recentActions.length === 0) return null;
              return (
                <div style={{ padding: "8px 16px 12px", borderTop: "1px solid #e8e0cc" }}>
                  {recentActions.map(e => {
                    const adef = ACTIONS.find(a => a.label === e.action);
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                        <div style={{ width: 16, height: 16, background: adef ? adef.bg : "#f5f0e8", border: "1px solid #1a1208", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {adef?.skill ? <SkillIcon skill={adef.skill} size={9} /> : <ActionSymbol size={9} />}
                        </div>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: "#1a1208", flexShrink: 0 }}>{e.action}</span>
                        {e.detail && <span style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.detail}</span>}
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
          <div style={{ display: "flex", gap: 2, margin: "0 0 2px", background: "#1a1208" }}>
            <button onClick={() => setActiveTab("enemies")}
              style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "10px 12px", background: enemies.length > 0 ? "rgba(184,32,32,0.3)" : "#1a1208", border: "none", borderRight: "1px solid rgba(201,168,76,0.3)", color: enemies.length > 0 ? "#ff6050" : "#c9a84c", cursor: "pointer" }}>
              {enemies.length > 0 ? `${enemies.length} ENEM${enemies.length === 1 ? "Y" : "IES"} IN PLAY` : "NO ENEMIES"}
            </button>
            <button onClick={() => setActiveTab("log")}
              style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "10px 12px", background: "#1a1208", border: "none", color: "#c9a84c", cursor: "pointer" }}>
              {actionLog.length} ACTION{actionLog.length !== 1 ? "S" : ""} LOGGED
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="d-tab-bar" style={{ marginBottom: 2 }}>
          {(["board","enemies","log","reference"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={activeTab === tab ? "d-tab-active" : "d-tab-inactive"}
              style={{ flex: 1, fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "2px", padding: "12px 8px", border: "none", cursor: "pointer", borderBottom: activeTab === tab ? "none" : "2px solid #1a1208" }}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════ */}
        {/* ── BOARD TAB ──────────────────────────── */}
        {activeTab === "board" && (
          <div>

            {/* Lead panel */}
            {leadPlayer && (
              <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", marginBottom: 2, padding: "12px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, background: "#c9a84c", border: "2px solid #1a1208", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg viewBox="0 0 20 20" width="18" height="18" fill="#1a1208"><path d="M10 2L12.4 7.5H18L13.4 11L15.3 17L10 13.5L4.7 17L6.6 11L2 7.5H7.6L10 2Z"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", marginBottom: 2 }}>LEAD INVESTIGATOR</div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "#1a1208" }}>{leadPlayer.player_name}</div>
                    <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>{leadPlayer.investigator}</div>
                  </div>
                  {isCreator && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                      {players.length > 1 && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {players.map((p, idx) => (
                            <button key={p.id}
                              onClick={() => pushTurnState({ ...turnState, leadInvestigatorIdx: idx })}
                              style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", padding: "4px 10px", background: idx === turnState.leadInvestigatorIdx ? "#c9a84c" : "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", cursor: "pointer" }}>
                              {p.player_name}
                            </button>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setReorderMode(!reorderMode)}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700, letterSpacing: "1px", padding: "6px 10px", background: reorderMode ? "#2e8a50" : "#f5f0e8", border: "2px solid #1a1208", color: reorderMode ? "#f2e8cc" : "#1a1208", cursor: "pointer" }}>
                        {reorderMode ? "✓ DONE" : "⇅ REORDER TURN"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Acting-as switcher — lead only */}
            {isLead && turnState.phase === "investigation" && orderedPlayers.length > 1 && (
              <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", marginBottom: 2, padding: "12px 16px" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", marginBottom: 8 }}>★ LEAD — LOGGING ACTIONS FOR:</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => setActingAsPlayerId(null)}
                    style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: actingAsPlayerId === null ? "#1a1208" : "#f5f0e8", border: "2px solid #1a1208", color: actingAsPlayerId === null ? "#f2e8cc" : "#1a1208", cursor: "pointer" }}>
                    CURRENT PLAYER
                  </button>
                  {orderedPlayers.map(p => {
                    const pInv = investigators.find(i => i.name === p.investigator);
                    const pCls = CLASS_COLORS[pInv?.class ?? "Guardian"];
                    const isSelected = actingAsPlayerId === p.id;
                    return (
                      <button key={p.id} onClick={() => setActingAsPlayerId(isSelected ? null : p.id)}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: isSelected ? "#1a1208" : "#f5f0e8", border: `2px solid ${pCls.hex}`, color: isSelected ? pCls.hex : "#1a1208", cursor: "pointer" }}>
                        {p.player_name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section head + add investigator */}
            <div className="d-section-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>INVESTIGATORS ({players.length})</span>
              {isCreator && (
                <button onClick={() => setShowAddPlayer(!showAddPlayer)}
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "4px 10px", background: "#1a1208", border: "none", color: "#c9a84c", cursor: "pointer" }}>
                  + ADD
                </button>
              )}
            </div>

            {isCreator && showAddPlayer && (
              <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", padding: "16px 16px", marginBottom: 2 }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208", marginBottom: 12 }}>Add Investigator</div>
                <input value={addingName} onChange={e => setAddingName(e.target.value)} placeholder="Player name"
                  className="d-input" style={{ width: "100%", marginBottom: 8, boxSizing: "border-box" }} />
                <select value={addingInvestigator} onChange={e => setAddingInvestigator(e.target.value)}
                  className="d-input" style={{ width: "100%", marginBottom: 12, boxSizing: "border-box" }}>
                  {investigators.map(inv => <option key={inv.name} value={inv.name}>{inv.name} ({inv.class})</option>)}
                </select>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowAddPlayer(false)} className="d-btn-outline" style={{ flex: 1 }}>Cancel</button>
                  <button onClick={handleAddPlayer} disabled={addingPlayer || !addingName.trim()} className="d-btn-gold" style={{ flex: 1, opacity: (addingPlayer || !addingName.trim()) ? 0.4 : 1 }}>
                    {addingPlayer ? "Adding…" : "Add to Session"}
                  </button>
                </div>
              </div>
            )}

            {players.length === 0 ? (
              <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", padding: "40px 16px", textAlign: "center", marginBottom: 2 }}>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>No investigators yet — add one above.</div>
              </div>
            ) : (
              <div>
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
                      <div key={player.id} className="d-player-card" style={{ borderLeft: `5px solid ${cls.hex}`, marginBottom: 2 }}>
                        {/* Header row */}
                        <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 12 }}>
                          {reorderMode && isCreator && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <button onClick={() => handleReorderPlayer(player.id, "up")} disabled={orderedPlayers[0]?.id === player.id}
                                style={{ width: 22, height: 22, background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", fontFamily: "'Cinzel', serif", fontSize: 11, cursor: "pointer", opacity: orderedPlayers[0]?.id === player.id ? 0.3 : 1 }}>↑</button>
                              <button onClick={() => handleReorderPlayer(player.id, "down")} disabled={orderedPlayers[orderedPlayers.length-1]?.id === player.id}
                                style={{ width: 22, height: 22, background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", fontFamily: "'Cinzel', serif", fontSize: 11, cursor: "pointer", opacity: orderedPlayers[orderedPlayers.length-1]?.id === player.id ? 0.3 : 1 }}>↓</button>
                            </div>
                          )}
                          <div style={{ width: 44, height: 44, background: "#1a1208", border: `2px solid ${cls.hex}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: cls.hex }}>
                            {player.investigator[0]}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span className="d-player-name-lbl">{player.player_name}</span>
                              {isMe && <span className="d-badge-you" style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "2px 6px" }}>YOU</span>}
                              {isThisLead && <span className="d-badge-lead" style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "2px 6px" }}>★ LEAD</span>}
                              {isActive && <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "2px 6px", background: cls.hex, color: "#1a1208" }}>ACTIVE</span>}
                            </div>
                            <div className="d-player-inv-lbl">{player.investigator}{inv ? ` · ${inv.class}` : ""}</div>
                          </div>
                          {isCreator && (
                            <button onClick={() => handleRemove(player)}
                              style={{ width: 28, height: 28, background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", fontFamily: "'Cinzel', serif", fontSize: 12, cursor: "pointer", flexShrink: 0 }}
                              aria-label={`Remove ${player.player_name}`}>✕</button>
                          )}
                        </div>

                        {/* Status banners */}
                        {(isDefeated || isInsane) && (
                          <div style={{ margin: "0 16px 10px", background: isDefeated ? "#b82020" : "#6a40b8", padding: "8px 12px", fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", color: "#f2e8cc", textAlign: "center" }}>
                            {isDefeated ? "DEFEATED — TAKE 1 PHYSICAL TRAUMA" : "INSANE — TAKE 1 MENTAL TRAUMA"}
                          </div>
                        )}

                        {/* Engaged enemies warning */}
                        {engagedEnemies.length > 0 && (
                          <div style={{ margin: "0 16px 10px", background: "#fff", border: "2px solid #b82020", borderLeft: "5px solid #b82020", padding: "8px 12px" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, color: "#b82020", marginBottom: 4 }}>
                              {engagedEnemies.length} ENEM{engagedEnemies.length === 1 ? "Y" : "IES"} ENGAGED — AoO APPLIES!
                            </div>
                            {engagedEnemies.map(e => (
                              <div key={e.id} style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>
                                {e.name} · Fght {e.fightVal} / Evd {e.evadeVal} / HP {e.currentDamage}/{e.health}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Stat strip */}
                        <div className="d-stat-strip" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                          {/* DMG */}
                          <div style={{ padding: "10px 12px", borderRight: "1px solid rgba(201,168,76,0.2)", textAlign: "center" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#ff6050", lineHeight: 1 }}>{player.damage}</div>
                            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "1px", marginTop: 2 }}>/{maxHealth} DMG</div>
                            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6 }}>
                              <button onClick={() => handleStatChange(player, "damage", 1)} className="d-adj-btn">+</button>
                              <button onClick={() => handleStatChange(player, "damage", -1)} disabled={player.damage === 0} className="d-adj-btn" style={{ opacity: player.damage === 0 ? 0.3 : 1 }}>−</button>
                            </div>
                          </div>
                          {/* HOR */}
                          <div style={{ padding: "10px 12px", borderRight: "1px solid rgba(201,168,76,0.2)", textAlign: "center" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#c090ff", lineHeight: 1 }}>{player.horror}</div>
                            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "1px", marginTop: 2 }}>/{maxSanity} HOR</div>
                            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6 }}>
                              <button onClick={() => handleStatChange(player, "horror", 1)} className="d-adj-btn">+</button>
                              <button onClick={() => handleStatChange(player, "horror", -1)} disabled={player.horror === 0} className="d-adj-btn" style={{ opacity: player.horror === 0 ? 0.3 : 1 }}>−</button>
                            </div>
                          </div>
                          {/* RES */}
                          <div style={{ padding: "10px 12px", borderRight: "1px solid rgba(201,168,76,0.2)", textAlign: "center" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#f0c060", lineHeight: 1 }}>{player.resources}</div>
                            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "1px", marginTop: 2 }}>RES</div>
                            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6 }}>
                              <button onClick={() => handleStatChange(player, "resources", 1)} className="d-adj-btn">+</button>
                              <button onClick={() => handleStatChange(player, "resources", -1)} disabled={player.resources === 0} className="d-adj-btn" style={{ opacity: player.resources === 0 ? 0.3 : 1 }}>−</button>
                            </div>
                          </div>
                          {/* CLUES */}
                          <div style={{ padding: "10px 12px", textAlign: "center" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, color: "#60e090", lineHeight: 1 }}>{player.clues}</div>
                            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "1px", marginTop: 2 }}>CLUES</div>
                            <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 6 }}>
                              <button onClick={() => handleStatChange(player, "clues", 1)} className="d-adj-btn">+</button>
                              <button onClick={() => handleStatChange(player, "clues", -1)} disabled={player.clues === 0} className="d-adj-btn" style={{ opacity: player.clues === 0 ? 0.3 : 1 }}>−</button>
                            </div>
                          </div>
                        </div>

                        {/* Skill stats */}
                        {inv && (
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", borderTop: "1px solid #e8e0cc" }}>
                            {[
                              { val: inv.willpower, color: "#9070d8", label: "WIL" },
                              { val: inv.intellect, color: "#c8871a", label: "INT" },
                              { val: inv.combat,    color: "#b82020", label: "COM" },
                              { val: inv.agility,   color: "#2e8a50", label: "AGI" },
                            ].map((s, i) => (
                              <div key={s.label} style={{ padding: "8px 0", textAlign: "center", borderRight: i < 3 ? "1px solid #e8e0cc" : "none" }}>
                                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", color: "#8a7040" }}>{s.label}</div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Ability */}
                        {inv && (
                          <div style={{ padding: "10px 16px", borderTop: "1px solid #e8e0cc", background: "#f5f0e8" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", marginBottom: 4 }}>ABILITY</div>
                            <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic", lineHeight: 1.4 }}>{inv.ability}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
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
              <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", padding: "40px 16px", textAlign: "center", marginBottom: 2 }}>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>No enemies in play. Remain vigilant.</div>
              </div>
            ) : enemies.map(enemy => {
              const hpLeft = Math.max(0, enemy.health - enemy.currentDamage);
              const hpPct = Math.min((hpLeft / Math.max(1, enemy.health)) * 100, 100);
              const isMassive = enemy.keywords.includes("Massive");

              return (
                <div key={enemy.id} className="d-player-card" style={{ borderLeft: `5px solid ${enemy.exhausted ? "#4a8fd4" : "#b82020"}`, marginBottom: 2, opacity: enemy.exhausted ? 0.85 : 1 }}>
                  {/* Name row */}
                  <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "#1a1208" }}>{enemy.name}</span>
                        {enemy.exhausted && <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "2px 6px", background: "#4a8fd4", color: "#f2e8cc" }}>EXHAUSTED</span>}
                        {isMassive && <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "2px 6px", background: "#c8871a", color: "#f2e8cc" }}>MASSIVE</span>}
                      </div>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {enemy.keywords.filter(k => k !== "Massive").map(kw => {
                          const kwDef = ENEMY_KEYWORDS.find(k => k.key === kw);
                          return <span key={kw} style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "2px 6px", background: `${kwDef?.color ?? "#888"}20`, color: kwDef?.color ?? "#888", border: `1px solid ${kwDef?.color ?? "#888"}40` }}>{kw}</span>;
                        })}
                      </div>
                    </div>
                    {isLead && (
                      <button onClick={() => handleDefeatEnemy(enemy.id)}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: "#2e8a50", border: "2px solid #1a1208", color: "#f2e8cc", cursor: "pointer", flexShrink: 0 }}>
                        ✓ DEFEAT
                      </button>
                    )}
                  </div>

                  {/* Stat grid */}
                  <div className="d-stat-strip" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <div style={{ padding: "8px 10px", borderRight: "1px solid rgba(201,168,76,0.2)", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: "#ff6050", lineHeight: 1 }}>{enemy.fightVal}</div>
                      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "1px" }}>FIGHT</div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRight: "1px solid rgba(201,168,76,0.2)", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: "#f0c060", lineHeight: 1 }}>{enemy.evadeVal}</div>
                      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "1px" }}>EVADE</div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRight: "1px solid rgba(201,168,76,0.2)", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: "#c090ff", lineHeight: 1 }}>{enemy.damage}/{enemy.horror}</div>
                      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "1px" }}>DMG/HOR</div>
                    </div>
                    <div style={{ padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, color: hpPct > 50 ? "#60e090" : hpPct > 25 ? "#f0c060" : "#ff6050", lineHeight: 1 }}>{hpLeft}/{enemy.health}</div>
                      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 10, color: "#c9a84c", textTransform: "uppercase", letterSpacing: "1px" }}>HP</div>
                    </div>
                  </div>

                  {/* HP controls */}
                  {isLead && (
                    <div style={{ padding: "8px 16px", borderBottom: "1px solid #e8e0cc", display: "flex", gap: 8 }}>
                      <button onClick={() => handleEnemyDamage(enemy.id, 1)}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 16px", background: "#1a1208", border: "2px solid #b82020", color: "#ff6050", cursor: "pointer", flex: 1 }}>
                        + HIT
                      </button>
                      <button onClick={() => handleEnemyDamage(enemy.id, -1)}
                        style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 16px", background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", cursor: "pointer", flex: 1 }}>
                        − HEAL
                      </button>
                    </div>
                  )}

                  {/* Engagement */}
                  <div style={{ padding: "10px 16px" }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "2px", color: "#8a7040", marginBottom: 8 }}>
                      {isMassive ? "ENGAGED WITH (MASSIVE)" : "ENGAGED WITH"}
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      {players.map(p => {
                        const pInv = investigators.find(i => i.name === p.investigator);
                        const pCls = CLASS_COLORS[pInv?.class ?? "Guardian"];
                        const engaged = enemy.engagedPlayerIds.includes(p.id);
                        return isLead ? (
                          <button key={p.id} onClick={() => handleEnemyEngage(enemy.id, p.id)}
                            style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: engaged ? "#1a1208" : "#f5f0e8", border: `2px solid ${pCls.hex}`, color: engaged ? pCls.hex : "#1a1208", cursor: "pointer" }}>
                            {engaged ? "⚔ " : ""}{p.player_name}
                          </button>
                        ) : (
                          <span key={p.id}
                            style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "6px 12px", background: engaged ? "#1a1208" : "#f5f0e8", border: `2px solid ${pCls.hex}`, color: engaged ? pCls.hex : "#1a1208" }}>
                            {engaged ? "⚔ " : ""}{p.player_name}
                          </span>
                        );
                      })}
                      {enemy.engagedPlayerIds.length === 0 && (
                        <span style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>Unengaged</span>
                      )}
                    </div>
                    {isLead && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => handleToggleExhaust(enemy.id)}
                          style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 12px", background: enemy.exhausted ? "#f5f0e8" : "#1a1208", border: `2px solid ${enemy.exhausted ? "#2e8a50" : "#4a8fd4"}`, color: enemy.exhausted ? "#2e8a50" : "#4a8fd4", cursor: "pointer", flex: 1 }}>
                          {enemy.exhausted ? "✓ READY" : "EXHAUST"}
                        </button>
                        {(() => {
                          const hasTargets = enemy.engagedPlayerIds.length > 0;
                          return (
                            <button onClick={() => handleEnemyAttack(enemy)} disabled={!hasTargets || enemy.exhausted}
                              style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", padding: "8px 12px", background: hasTargets && !enemy.exhausted ? "#b82020" : "#f5f0e8", border: "2px solid #1a1208", color: hasTargets && !enemy.exhausted ? "#f2e8cc" : "#8a8070", cursor: hasTargets && !enemy.exhausted ? "pointer" : "default", flex: 1, opacity: enemy.exhausted ? 0.4 : 1 }}>
                              ⚔ ATTACKS!
                            </button>
                          );
                        })()}
                      </div>
                    )}
                    {enemy.engagedPlayerIds.length > 0 && !isLead && (
                      <div style={{ background: "#fff8e8", border: "2px solid #b82020", borderLeft: "5px solid #b82020", padding: "8px 12px", fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>
                        Deals <strong style={{ color: "#b82020" }}>{enemy.damage} damage</strong> + <strong style={{ color: "#6a40b8" }}>{enemy.horror} horror</strong> per attack — lead applies it.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Keyword reference */}
            <div className="d-section-head" style={{ cursor: "pointer" }}>
              <span>KEYWORD REFERENCE</span>
            </div>
            <div style={{ marginBottom: 2 }}>
              {ENEMY_KEYWORDS.map(kw => (
                <div key={kw.key} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px", background: "#fff", borderBottom: "1px solid #e8e0cc" }}>
                  <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "3px 8px", background: `${kw.color}15`, border: `1px solid ${kw.color}40`, color: kw.color, flexShrink: 0 }}>{kw.key}</span>
                  <span style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", lineHeight: 1.4 }}>{kw.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════ */}
        {/* ── LOG TAB ───────────────────────────── */}
        {activeTab === "log" && (
          <div>
            <div className="d-section-head" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>{actionLog.length} ACTION{actionLog.length !== 1 ? "S" : ""} LOGGED</span>
              {actionLog.length > 0 && isLead && (
                <button onClick={() => { setActionLog([]); if (session) appendActionLog(session.id, [], { id: "clear", playerName: "", investigator: "", action: "Log Cleared", detail: "", timestamp: new Date().toISOString(), round: turnState.round, actionNum: 0, phase: turnState.phase }); }}
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 9, fontWeight: 700, letterSpacing: "1px", padding: "4px 10px", background: "#1a1208", border: "none", color: "#c9a84c", cursor: "pointer" }}>
                  CLEAR
                </button>
              )}
            </div>
            {actionLog.length === 0 ? (
              <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", padding: "40px 16px", textAlign: "center" }}>
                <div style={{ fontFamily: "'IM Fell English', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>No actions logged yet. The chronicle awaits.</div>
              </div>
            ) : (
              <div>
                {actionLog.map(entry => {
                  const actionDef = ACTIONS.find(a => a.label === entry.action);
                  const phaseInfo = PHASES.find(p => p.id === entry.phase);
                  return (
                    <div key={entry.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: "#fff", borderBottom: "1px solid #e8e0cc" }}>
                      <div style={{ width: 32, height: 32, background: "#1a1208", border: `2px solid ${actionDef?.color ?? "#c9a84c"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {actionDef?.skill ? <SkillIcon skill={actionDef.skill} size={14} /> : <ActionSymbol size={14} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208" }}>{entry.playerName}</span>
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: actionDef?.color ?? "#c9a84c" }}>{entry.action}</span>
                          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 9, color: "#8a7040", marginLeft: "auto" }}>R{entry.round}{phaseInfo ? ` · ${phaseInfo.label[0]}` : ""}</span>
                        </div>
                        {entry.detail && <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", marginTop: 2 }}>{entry.detail}</div>}
                      </div>
                      <button onClick={() => handleDeleteLogEntry(entry.id)}
                        style={{ width: 24, height: 24, background: "#f5f0e8", border: "2px solid #1a1208", color: "#1a1208", fontFamily: "'Cinzel', serif", fontSize: 11, cursor: "pointer", flexShrink: 0 }}>✕</button>
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
          <div>
            {/* Round structure */}
            <div className="d-section-head"><span>ROUND STRUCTURE</span></div>
            <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", marginBottom: 2 }}>
              {PHASES.map((phase, i) => (
                <div key={phase.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderBottom: i < 3 ? "1px solid #e8e0cc" : "none" }}>
                  <div style={{ width: 28, height: 28, background: "#1a1208", border: `2px solid ${phase.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: phase.color }}>{i+1}</div>
                  <div>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208", marginBottom: 2 }}>{phase.label}</div>
                    <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>{phase.desc.split(",")[0]}</div>
                  </div>
                </div>
              ))}
              <div style={{ padding: "10px 16px", fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", fontStyle: "italic" }}>Round 1 skips the Mythos Phase entirely.</div>
            </div>

            {/* Skill icons */}
            <div className="d-section-head"><span>SKILL ICONS</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, background: "#1a1208", marginBottom: 2 }}>
              {[
                { skill: "WIL", label: "Willpower", color: "#9070d8", desc: "Treacheries, Parley, horror tests" },
                { skill: "INT", label: "Intellect",  color: "#4a8fd4", desc: "Investigate, clue discovery" },
                { skill: "COM", label: "Combat",     color: "#b82020", desc: "Fight tests, defeating enemies" },
                { skill: "AGI", label: "Agility",    color: "#2e8a50", desc: "Evade tests, movement" },
              ].map(s => (
                <div key={s.skill} style={{ background: "#fff", padding: "14px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <SkillIcon skill={s.skill} size={22} />
                    <div>
                      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208" }}>{s.label}</div>
                      <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10" }}>{s.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chaos bag */}
            <div className="d-section-head"><span>{turnState.campaignId && CAMPAIGNS.find(c => c.id === turnState.campaignId)?.name ? CAMPAIGNS.find(c => c.id === turnState.campaignId)!.name.toUpperCase() : "STANDARD"} CHAOS BAG</span></div>
            <div style={{ background: "#fff", borderBottom: "2px solid #e8e0cc", padding: "14px 16px", display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 2 }}>
              {CHAOS_TOKENS.map((t, i) => (
                <span key={i} style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, padding: "4px 10px", background: `${t.color}15`, border: `2px solid ${t.color}40`, color: t.color }}>{t.token}</span>
              ))}
            </div>

            {/* Easily missed rules */}
            <div className="d-section-head"><span>EASILY MISSED RULES</span></div>
            <div style={{ marginBottom: 2 }}>
              {MISSED_RULES.map((r, i) => (
                <div key={i} style={{ background: "#fff", borderBottom: "1px solid #e8e0cc", padding: "14px 16px", borderLeft: "5px solid #c9a84c" }}>
                  <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "#1a1208", marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontFamily: "'Crimson Text', serif", fontSize: 14, color: "#5a3a10", lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>{/* end maxWidth wrapper */}
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
