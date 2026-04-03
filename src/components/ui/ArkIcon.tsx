// Arkham Horror 2026 – Art Deco SVG icon set
// Matches the geometric/symbolic style of the 2026 core set card faces.

interface ArkIconProps {
  id: keyof typeof icons;
  size?: number;
  color?: string;
  className?: string;
}

const icons = {
  // ── Actions ──────────────────────────────────────────────────────────────
  investigate: (
    // Magnifying glass
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6" />
      <line x1="14.5" y1="14.5" x2="21" y2="21" />
      <line x1="10" y1="7" x2="10" y2="13" strokeWidth="1.2" />
      <line x1="7" y1="10" x2="13" y2="10" strokeWidth="1.2" />
    </svg>
  ),
  move: (
    // Arrow with footstep geometry
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  ),
  fight: (
    // Crossed swords – core Arkham combat icon
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="4" x2="20" y2="20" />
      <line x1="20" y1="4" x2="4" y2="20" />
      <line x1="4" y1="4" x2="7" y2="7" strokeWidth="3" />
      <line x1="20" y1="4" x2="17" y2="7" strokeWidth="3" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  ),
  evade: (
    // Curved dash / sidestep
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12c0-4 3-6 6-6s5 2 5 6-2 5-5 6" />
      <path d="M15 18l4-4-4-4" />
    </svg>
  ),
  engage: (
    // Target reticle
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  ),
  draw: (
    // Card with corner fold
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="12" height="16" rx="1.5" />
      <rect x="8" y="5" width="12" height="16" rx="1.5" />
      <line x1="11" y1="11" x2="17" y2="11" strokeWidth="1.2" />
      <line x1="11" y1="14" x2="15" y2="14" strokeWidth="1.2" />
    </svg>
  ),
  resource: (
    // Coin / resource token
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10M9.5 9.5c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5c0 2-2.5 2.5-2.5 4.5 0 1.4 1.1 2.5 2.5 2.5" />
    </svg>
  ),
  play: (
    // Hand holding card
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="14" rx="1.5" />
      <path d="M5 10v8a2 2 0 002 2h10a2 2 0 002-2v-8" />
      <line x1="10" y1="6" x2="14" y2="6" strokeWidth="1.2" />
      <line x1="10" y1="9" x2="14" y2="9" strokeWidth="1.2" />
    </svg>
  ),
  activate: (
    // Lightning bolt
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13,2 4,14 11,14 11,22 20,10 13,10" />
    </svg>
  ),
  resign: (
    // Door with arrow out
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3h5a1 1 0 011 1v16a1 1 0 01-1 1h-5" />
      <polyline points="9,15 4,12 9,9" />
      <line x1="4" y1="12" x2="14" y2="12" />
    </svg>
  ),
  endturn: (
    // Skip forward
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5,4 15,12 5,20" />
      <line x1="18" y1="4" x2="18" y2="20" />
    </svg>
  ),

  // ── Stats ─────────────────────────────────────────────────────────────────
  health: (
    // Heart with cross
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21C12 21 3 14 3 8a5 5 0 019-3 5 5 0 019 3c0 6-9 13-9 13z" />
    </svg>
  ),
  sanity: (
    // Crescent moon / mind
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
    </svg>
  ),
  clue: (
    // Magnifier dot
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="6" />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      <line x1="14.5" y1="14.5" x2="21" y2="21" />
    </svg>
  ),
  doom: (
    // Skull / eye
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="7" />
      <path d="M8 10a1 1 0 012 0 1 1 0 01-2 0zM14 10a1 1 0 012 0 1 1 0 01-2 0z" fill="currentColor" stroke="none" />
      <path d="M9 17v3M12 17v3M15 17v3" />
    </svg>
  ),

  // ── UI ────────────────────────────────────────────────────────────────────
  share: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
      <polyline points="16,6 12,2 8,6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  players: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
      <circle cx="19" cy="7" r="3" />
      <path d="M22 21v-1.5a3 3 0 00-3-3" />
    </svg>
  ),
  board: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="12" y1="2" x2="12" y2="22" />
    </svg>
  ),
  log: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="12" y2="16" />
    </svg>
  ),
  reference: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="15" y2="11" />
    </svg>
  ),
  defeated: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="6" />
      <path d="M9 9a1 1 0 012 0 1 1 0 01-2 0zM13 9a1 1 0 012 0 1 1 0 01-2 0z" fill="currentColor" stroke="none" />
      <path d="M9 14s1-1 3-1 3 1 3 1" />
      <path d="M8 18v3M12 17v4M16 18v3" />
    </svg>
  ),
  insane: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12c0-2 1.5-4 4-4s4 2 4 4-1.5 3-4 5" />
      <circle cx="12" cy="19" r="1" fill="currentColor" />
    </svg>
  ),
} as const;

export default function ArkIcon({ id, size = 20, color, className = "" }: ArkIconProps) {
  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size, color }}
    >
      {icons[id]}
    </span>
  );
}
