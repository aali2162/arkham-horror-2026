"use client";

import { GamePlayer } from "@/types";
import { investigators } from "@/data/investigators";
import { updatePlayerStat, removePlayer } from "@/lib/session";

interface PlayerCardProps {
  player: GamePlayer;
  isMe?: boolean;        // true when this card belongs to the device viewing it
  isLead?: boolean;      // true when the viewing device is the lead investigator
  onStatChange?: (field: "damage" | "horror" | "resources", delta: number) => void;
}

// ── Skill SVG Icons — colours matched exactly to rulebook quick-reference ──────
function WillpowerIcon({ size = 15 }: { size?: number }) {
  const color = "#9070d8";
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <title>Willpower</title>
      <path d="M7 10V6.5a1 1 0 012 0V10h.5V5.5a1 1 0 012 0V10h.5V6.5a1 1 0 012 0V11.5c0 2.5-1.5 5-4 5.5H8c-2 0-3-1.5-3-3V12a1 1 0 011-1h1v-1z" fillOpacity="0.85"/>
    </svg>
  );
}

function IntellectIcon({ size = 15 }: { size?: number }) {
  const color = "#c8871a";
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <title>Intellect</title>
      <path d="M10 5C8 3.5 4 3.5 2 5v10c2-1.5 6-1.5 8 0V5z" fill={color} fillOpacity="0.7" stroke={color} strokeWidth="0.8"/>
      <path d="M10 5c2-1.5 6-1.5 8 0v10c-2-1.5-6-1.5-8 0V5z" fill={color} fillOpacity="0.45" stroke={color} strokeWidth="0.8"/>
      <line x1="10" y1="5" x2="10" y2="15" stroke={color} strokeWidth="1" strokeOpacity="0.6"/>
    </svg>
  );
}

function CombatIcon({ size = 15 }: { size?: number }) {
  const color = "#c03028";
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <title>Combat</title>
      <path d="M5 9.5V8a1.5 1.5 0 013 0v1.5h.4V7a1.5 1.5 0 013 0v2.5h.4V8a1.5 1.5 0 013 0v2.5c0 1-.3 2-.8 2.8L13 15H7l-1-1.5C5.4 12.6 5 11.5 5 10.5V9.5z" fillOpacity="0.85"/>
      <rect x="5" y="15" width="10" height="2.5" rx="1.2" fillOpacity="0.7"/>
    </svg>
  );
}

function AgilityIcon({ size = 15 }: { size?: number }) {
  const color = "#2e8a50";
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill={color}>
      <title>Agility</title>
      <circle cx="13.5" cy="3.5" r="2" fillOpacity="0.9"/>
      <path d="M12 6l-3 3.5 1.5 1L8 14h2l2-3 1.5 1L16 9l-2-1.5" fillOpacity="0.85"/>
      <path d="M9 9.5L6.5 12l1 1L10 11" fillOpacity="0.7"/>
      <line x1="3" y1="8" x2="7" y2="8" stroke={color} strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round"/>
      <line x1="2" y1="11" x2="6" y2="11" stroke={color} strokeWidth="1" strokeOpacity="0.35" strokeLinecap="round"/>
    </svg>
  );
}

// ── Class colours — matched to rulebook ───────────────────────────────────────
const CLASS_HEX: Record<string, string> = {
  Guardian: "#4a8fd4",
  Seeker:   "#c8871a",
  Rogue:    "#2e8a50",
  Mystic:   "#7050b8",
  Survivor: "#b82020",
};

export default function PlayerCard({ player, isMe = false, isLead = false, onStatChange }: PlayerCardProps) {
  const inv = investigators.find((i) => i.name === player.investigator);
  const classColor = CLASS_HEX[inv?.class ?? "Guardian"] ?? "#4a8fd4";

  const handleStat = async (
    field: "damage" | "horror" | "resources",
    delta: number
  ) => {
    const newVal = Math.max(0, player[field] + delta);
    if (onStatChange) {
      onStatChange(field, delta);
    } else {
      await updatePlayerStat(player.id, field, newVal);
    }
  };

  const handleRemove = async () => {
    if (confirm(`Remove ${player.player_name}?`)) {
      await removePlayer(player.id);
    }
  };

  const maxHealth = inv?.health ?? 9;
  const maxSanity = inv?.sanity ?? 7;
  const healthPct  = Math.min((player.damage / maxHealth) * 100, 100);
  const sanityPct  = Math.min((player.horror / maxSanity) * 100, 100);
  const isDefeated = player.damage >= maxHealth;
  const isInsane   = player.horror >= maxSanity;

  // Controls are editable if this is the viewer's own card OR the lead is viewing
  const canEdit = isMe || isLead;

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: "#ecdcb0",
        border: `1.5px solid ${isMe ? classColor : "#c8a860"}`,
        boxShadow: isMe
          ? `0 0 0 2px ${classColor}30, 0 4px 16px rgba(90,58,8,0.15)`
          : "0 2px 8px rgba(90,58,8,0.10)",
      }}
    >
      {/* Class colour top stripe */}
      <div style={{ height: 4, background: classColor }} />

      <div className="p-4">

        {/* ── Header: name + YOU badge + remove ── */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-decorative font-bold text-base text-ark-text leading-tight truncate">
                {player.player_name}
              </h3>
              {isMe && (
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: classColor, color: "#fff", letterSpacing: "0.08em" }}
                >
                  YOU
                </span>
              )}
            </div>
            <p className="text-[11px] font-body mt-0.5" style={{ color: "#8a7040" }}>
              {player.investigator}
              {inv && (
                <span style={{ color: classColor }}> · {inv.class}</span>
              )}
            </p>
          </div>

          {/* Remove button — lead only */}
          {isLead && (
            <button
              onClick={handleRemove}
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-all"
              style={{ background: "rgba(192,48,40,0.08)", border: "1px solid rgba(192,48,40,0.2)", color: "#c03028" }}
              title="Remove player"
            >
              ✕
            </button>
          )}
        </div>

        {/* ── Health bar ── */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="font-mono" style={{ color: "#c03028" }}>
              ♥ {player.damage} / {maxHealth}
            </span>
            {isDefeated && (
              <span className="font-bold font-decorative text-[10px] animate-pulse" style={{ color: "#c03028" }}>
                DEFEATED
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(192,48,40,0.15)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${healthPct}%`,
                background: healthPct > 60 ? "#c03028" : healthPct > 30 ? "#e06820" : "#e03020",
              }}
            />
          </div>
        </div>

        {/* ── Sanity bar ── */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="font-mono" style={{ color: "#7050b8" }}>
              ✦ {player.horror} / {maxSanity}
            </span>
            {isInsane && (
              <span className="font-bold font-decorative text-[10px] animate-pulse" style={{ color: "#7050b8" }}>
                INSANE
              </span>
            )}
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(112,80,184,0.15)" }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${sanityPct}%`,
                background: "#7050b8",
              }}
            />
          </div>
        </div>

        {/* ── Damage + Horror controls (2 columns) ── */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <StatControl
            label="Damage"
            value={player.damage}
            accentColor="#c03028"
            canEdit={canEdit}
            onMinus={() => handleStat("damage", -1)}
            onPlus={() => handleStat("damage", 1)}
          />
          <StatControl
            label="Horror"
            value={player.horror}
            accentColor="#7050b8"
            canEdit={canEdit}
            onMinus={() => handleStat("horror", -1)}
            onPlus={() => handleStat("horror", 1)}
          />
        </div>

        {/* ── Resources — standalone prominent token row ── */}
        <div
          className="rounded-xl px-3 py-2.5 flex items-center justify-between"
          style={{
            background: "rgba(201,151,58,0.10)",
            border: "1px solid rgba(201,151,58,0.35)",
          }}
        >
          <div className="flex items-center gap-2">
            {/* Hexagonal resource token icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L17.3 6v8L10 18 2.7 14V6z" fill="rgba(201,151,58,0.20)" stroke="#c9973a" strokeWidth="1.4"/>
              <path d="M10 2v6M10 8l7.3-2M10 8l-7.3-2" stroke="#c9973a" strokeWidth="0.9" strokeOpacity="0.5"/>
            </svg>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest" style={{ color: "#8a6820" }}>Resources</p>
              <p className="font-mono font-bold text-xl leading-none" style={{ color: "#5a3a08" }}>{player.resources}</p>
            </div>
          </div>
          {canEdit && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleStat("resources", -1)}
                disabled={player.resources === 0}
                className="w-8 h-8 rounded-lg font-bold text-base transition-all disabled:opacity-30"
                style={{ background: "rgba(201,151,58,0.18)", border: "1px solid rgba(201,151,58,0.4)", color: "#8a6820" }}
              >
                −
              </button>
              <button
                onClick={() => handleStat("resources", 1)}
                className="w-8 h-8 rounded-lg font-bold text-base transition-all"
                style={{ background: "rgba(201,151,58,0.28)", border: "1px solid rgba(201,151,58,0.5)", color: "#5a3a08" }}
              >
                +
              </button>
            </div>
          )}
          {!canEdit && (
            <span className="font-mono text-[10px]" style={{ color: "#8a7040" }}>read only</span>
          )}
        </div>

        {/* ── Investigator skill stats with icons ── */}
        {inv && (
          <div
            className="mt-3 pt-2.5 grid grid-cols-4 gap-1 text-center"
            style={{ borderTop: "1px solid rgba(200,168,96,0.4)" }}
          >
            {[
              { icon: <WillpowerIcon />, value: inv.willpower, label: "Willpower",  color: "#9070d8" },
              { icon: <IntellectIcon />, value: inv.intellect, label: "Intellect",  color: "#c8871a" },
              { icon: <CombatIcon />,   value: inv.combat,    label: "Combat",      color: "#c03028" },
              { icon: <AgilityIcon />,  value: inv.agility,   label: "Agility",     color: "#2e8a50" },
            ].map(({ icon, value, label, color }) => (
              <div key={label} title={label}>
                <div className="flex justify-center mb-0.5">{icon}</div>
                <span className="font-mono font-bold text-sm" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Stat control sub-component ─── */
function StatControl({
  label,
  value,
  accentColor,
  canEdit,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  accentColor: string;
  canEdit: boolean;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div
      className="rounded-lg p-2 text-center"
      style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}25` }}
    >
      <p className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: accentColor }}>
        {label}
      </p>
      <div className="flex items-center justify-center gap-1.5">
        {canEdit && (
          <button
            onClick={onMinus}
            disabled={value === 0}
            className="w-6 h-6 rounded font-bold text-sm transition-all disabled:opacity-30"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            −
          </button>
        )}
        <span className="font-mono font-bold text-lg" style={{ color: accentColor, minWidth: 24 }}>
          {value}
        </span>
        {canEdit && (
          <button
            onClick={onPlus}
            className="w-6 h-6 rounded font-bold text-sm transition-all"
            style={{ background: `${accentColor}28`, color: accentColor }}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
