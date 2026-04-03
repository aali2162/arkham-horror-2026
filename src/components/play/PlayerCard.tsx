"use client";

import { GamePlayer } from "@/types";
import { investigators } from "@/data/investigators";
import { updatePlayerStat, removePlayer } from "@/lib/session";

interface PlayerCardProps {
  player: GamePlayer;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const inv = investigators.find((i) => i.name === player.investigator);

  const handleStat = async (
    field: "damage" | "horror" | "resources",
    delta: number
  ) => {
    const newVal = player[field] + delta;
    await updatePlayerStat(player.id, field, newVal);
  };

  const handleRemove = async () => {
    if (confirm(`Remove ${player.player_name}?`)) {
      await removePlayer(player.id);
    }
  };

  const maxHealth = inv?.health ?? 9;
  const maxSanity = inv?.sanity ?? 7;
  const healthPct = Math.min((player.damage / maxHealth) * 100, 100);
  const sanityPct = Math.min((player.horror / maxSanity) * 100, 100);

  return (
    <div className="card p-5 relative group">
      {/* Remove button */}
      <button
        onClick={handleRemove}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-ark-surface border border-ark-border text-ark-text-muted hover:text-ark-red hover:border-ark-red/50 transition-all text-xs opacity-0 group-hover:opacity-100"
        title="Remove player"
      >
        ✕
      </button>

      {/* Header */}
      <div className="mb-4">
        <h3 className="font-display font-bold text-lg text-ark-text">
          {player.player_name}
        </h3>
        <p className="text-ark-text-dim text-sm">
          {player.investigator}
          {inv && (
            <span className="text-ark-text-muted">
              {" "}· {inv.class}
            </span>
          )}
        </p>
      </div>

      {/* Health bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-ark-red font-medium">
            ❤️ Damage: {player.damage}/{maxHealth}
          </span>
          {player.damage >= maxHealth && (
            <span className="text-ark-red font-bold animate-pulse">DEFEATED</span>
          )}
        </div>
        <div className="h-2 bg-ark-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ark-red/80 to-ark-red rounded-full transition-all duration-500"
            style={{ width: `${healthPct}%` }}
          />
        </div>
      </div>

      {/* Sanity bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-ark-purple font-medium">
            🧠 Horror: {player.horror}/{maxSanity}
          </span>
          {player.horror >= maxSanity && (
            <span className="text-ark-purple font-bold animate-pulse">INSANE</span>
          )}
        </div>
        <div className="h-2 bg-ark-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ark-purple/80 to-ark-purple rounded-full transition-all duration-500"
            style={{ width: `${sanityPct}%` }}
          />
        </div>
      </div>

      {/* Stat Controls */}
      <div className="grid grid-cols-3 gap-3">
        <StatControl
          label="Damage"
          value={player.damage}
          icon="❤️"
          color="red"
          onMinus={() => handleStat("damage", -1)}
          onPlus={() => handleStat("damage", 1)}
        />
        <StatControl
          label="Horror"
          value={player.horror}
          icon="🧠"
          color="purple"
          onMinus={() => handleStat("horror", -1)}
          onPlus={() => handleStat("horror", 1)}
        />
        <StatControl
          label="Resources"
          value={player.resources}
          icon="💰"
          color="amber"
          onMinus={() => handleStat("resources", -1)}
          onPlus={() => handleStat("resources", 1)}
        />
      </div>

      {/* Investigator stats */}
      {inv && (
        <div className="mt-4 pt-3 border-t border-ark-border">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div>
              <span className="text-ark-text-muted block">WIL</span>
              <span className="font-bold text-ark-text">{inv.willpower}</span>
            </div>
            <div>
              <span className="text-ark-text-muted block">INT</span>
              <span className="font-bold text-ark-text">{inv.intellect}</span>
            </div>
            <div>
              <span className="text-ark-text-muted block">COM</span>
              <span className="font-bold text-ark-text">{inv.combat}</span>
            </div>
            <div>
              <span className="text-ark-text-muted block">AGI</span>
              <span className="font-bold text-ark-text">{inv.agility}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-component ─── */

function StatControl({
  label,
  value,
  icon,
  color,
  onMinus,
  onPlus,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-wider text-ark-text-muted">
        {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={onMinus}
          className="w-7 h-7 rounded-md bg-ark-surface border border-ark-border hover:border-ark-blue/50 text-ark-text-dim hover:text-ark-text transition-all text-sm font-bold"
        >
          −
        </button>
        <span className="w-8 text-center font-mono font-bold text-ark-text text-sm">
          {value}
        </span>
        <button
          onClick={onPlus}
          className="w-7 h-7 rounded-md bg-ark-surface border border-ark-border hover:border-ark-blue/50 text-ark-text-dim hover:text-ark-text transition-all text-sm font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
}
