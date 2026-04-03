// ============================================
// ARKHAM HORROR 2026 — CARD DATABASE
// Brethren of Ash Core Set
// ============================================
// Sources: Campaign Guide (all 3 scenarios) + Core Set card stats
// Enemy stats: fight / evade / health / damage / horror / keywords

export type CardType =
  | "enemy"
  | "location"
  | "asset"
  | "event"
  | "skill"
  | "treachery"
  | "act"
  | "agenda"
  | "story-asset"
  | "story-enemy";

export interface CardEntry {
  id: string;
  name: string;
  type: CardType;
  // Enemy-specific
  fight?: number;
  evade?: number;
  health?: number;
  damage?: number;
  horror?: number;
  keywords?: string[];
  // Location-specific
  shroud?: number;
  clues?: number;
  // General
  scenario?: string; // which scenario this belongs to
  encounterSet?: string;
  traits?: string[];
  victoryPoints?: number;
  notes?: string;
}

// -----------------------------------------------
// ENEMIES
// -----------------------------------------------
export const ENEMIES: CardEntry[] = [
  // --- Spreading Flames (Scenario I) ---
  {
    id: "servant-of-flame",
    name: "Servant of Flame",
    type: "story-enemy",
    fight: 3,
    evade: 4,
    health: 3,
    damage: 1,
    horror: 2,
    keywords: ["Hunter", "Retaliate"],
    scenario: "Spreading Flames",
    encounterSet: "Spreading Flames",
    traits: ["Humanoid", "Cultist", "Brethren of Ash"],
    victoryPoints: 1,
    notes: "Key enemy. Defeating adds to victory display. Codex Φ triggers on defeat.",
  },
  // --- Ashen Pilgrims encounter set ---
  {
    id: "ashen-pilgrim",
    name: "Ashen Pilgrim",
    type: "enemy",
    fight: 2,
    evade: 3,
    health: 2,
    damage: 1,
    horror: 1,
    keywords: ["Hunter"],
    encounterSet: "Ashen Pilgrims",
    traits: ["Humanoid", "Cultist", "Brethren of Ash"],
  },
  {
    id: "devoted-adherent",
    name: "Devoted Adherent",
    type: "enemy",
    fight: 3,
    evade: 2,
    health: 3,
    damage: 1,
    horror: 1,
    keywords: ["Retaliate"],
    encounterSet: "Ashen Pilgrims",
    traits: ["Humanoid", "Cultist", "Brethren of Ash"],
  },
  {
    id: "torch-bearer",
    name: "Torch Bearer",
    type: "enemy",
    fight: 2,
    evade: 3,
    health: 2,
    damage: 2,
    horror: 0,
    keywords: ["Hunter"],
    encounterSet: "Ashen Pilgrims",
    traits: ["Humanoid", "Cultist", "Brethren of Ash"],
  },
  // --- Cosmic Evils encounter set ---
  {
    id: "thrall-of-elokoss",
    name: "Thrall of Elokoss",
    type: "enemy",
    fight: 3,
    evade: 3,
    health: 3,
    damage: 1,
    horror: 2,
    keywords: ["Hunter", "Doomed"],
    encounterSet: "Cosmic Evils",
    traits: ["Humanoid", "Cultist"],
    notes: "Doomed: defeat adds 1 doom to agenda.",
  },
  {
    id: "spawn-of-the-void",
    name: "Spawn of the Void",
    type: "enemy",
    fight: 4,
    evade: 2,
    health: 4,
    damage: 2,
    horror: 1,
    keywords: ["Massive"],
    encounterSet: "Cosmic Evils",
    traits: ["Monster", "Extradimensional"],
    notes: "Massive: engages all investigators at its location.",
  },
  // --- Flying Terrors encounter set (Scenario II) ---
  {
    id: "whippoorwill",
    name: "Whippoorwill",
    type: "enemy",
    fight: 1,
    evade: 4,
    health: 1,
    damage: 0,
    horror: 1,
    keywords: ["Aloof", "Elusive", "Surge"],
    encounterSet: "Whippoorwills",
    traits: ["Creature", "Bird"],
    notes: "Aloof — spawns unengaged. Elusive — disengages after being attacked.",
  },
  {
    id: "flesh-eating-bat",
    name: "Flesh-Eating Bat",
    type: "enemy",
    fight: 2,
    evade: 4,
    health: 1,
    damage: 1,
    horror: 0,
    keywords: ["Hunter", "Alert"],
    encounterSet: "Flying Terrors",
    traits: ["Creature", "Beast"],
  },
  // --- Gangs of Arkham encounter set ---
  {
    id: "arkham-enforcer",
    name: "Arkham Enforcer",
    type: "enemy",
    fight: 3,
    evade: 2,
    health: 3,
    damage: 2,
    horror: 0,
    keywords: ["Retaliate"],
    encounterSet: "Gangs of Arkham",
    traits: ["Humanoid", "Criminal"],
  },
  {
    id: "mobster",
    name: "Mobster",
    type: "enemy",
    fight: 3,
    evade: 3,
    health: 2,
    damage: 1,
    horror: 1,
    keywords: [],
    encounterSet: "Gangs of Arkham",
    traits: ["Humanoid", "Criminal"],
  },
  // --- Cultists (Scenario III) ---
  {
    id: "cultist-of-ash",
    name: "Cultist of Ash",
    type: "enemy",
    fight: 2,
    evade: 3,
    health: 2,
    damage: 1,
    horror: 1,
    keywords: ["Hunter", "Doomed"],
    encounterSet: "Cultists",
    traits: ["Humanoid", "Cultist", "Brethren of Ash"],
  },
  {
    id: "elokoss-knight",
    name: "Elokoss's Knight",
    type: "story-enemy",
    fight: 4,
    evade: 3,
    health: 4,
    damage: 2,
    horror: 1,
    keywords: ["Hunter", "Retaliate", "Doomed"],
    scenario: "Queen of Ash",
    encounterSet: "Queen of Ash",
    traits: ["Humanoid", "Cultist", "Elite", "Brethren of Ash"],
    victoryPoints: 2,
  },
  {
    id: "herald-of-flame",
    name: "Herald of Flame",
    type: "story-enemy",
    fight: 4,
    evade: 4,
    health: 5,
    damage: 2,
    horror: 2,
    keywords: ["Hunter", "Doomed", "Massive"],
    scenario: "Queen of Ash",
    encounterSet: "Queen of Ash",
    traits: ["Monster", "Elite", "Brethren of Ash"],
    victoryPoints: 2,
    notes: "Massive: engages all investigators.",
  },
  {
    id: "queens-knight",
    name: "Queen's Knight",
    type: "story-enemy",
    fight: 4,
    evade: 3,
    health: 4,
    damage: 2,
    horror: 1,
    keywords: ["Hunter", "Retaliate", "Doomed"],
    scenario: "Queen of Ash",
    encounterSet: "Queen of Ash",
    traits: ["Humanoid", "Cultist", "Elite"],
    victoryPoints: 2,
  },
  // --- Reeking Decay encounter set ---
  {
    id: "rat-swarm",
    name: "Rat Swarm",
    type: "enemy",
    fight: 2,
    evade: 3,
    health: 3,
    damage: 1,
    horror: 0,
    keywords: ["Hunter", "Massive"],
    encounterSet: "Reeking Decay",
    traits: ["Creature", "Beast"],
    notes: "Massive: engages all investigators at its location.",
  },
  {
    id: "grotesque-statue",
    name: "Grotesque Statue",
    type: "enemy",
    fight: 3,
    evade: 1,
    health: 4,
    damage: 2,
    horror: 1,
    keywords: ["Retaliate"],
    encounterSet: "Reeking Decay",
    traits: ["Monster"],
  },
  // --- Torment encounter set ---
  {
    id: "tormented-soul",
    name: "Tormented Soul",
    type: "enemy",
    fight: 2,
    evade: 4,
    health: 2,
    damage: 0,
    horror: 2,
    keywords: ["Aloof", "Hunter"],
    encounterSet: "Torment",
    traits: ["Monster", "Spectral"],
    notes: "Deals horror only.",
  },
];

// -----------------------------------------------
// LOCATIONS
// -----------------------------------------------
export const LOCATIONS: CardEntry[] = [
  // Scenario I — Spreading Flames (Miskatonic University)
  {
    id: "your-friends-room",
    name: "Your Friend's Room",
    type: "location",
    shroud: 1,
    clues: 2,
    scenario: "Spreading Flames",
    traits: ["Miskatonic"],
    notes: "Starting location for all investigators.",
  },
  {
    id: "miskatonic-university",
    name: "Miskatonic University",
    type: "location",
    shroud: 3,
    clues: 2,
    scenario: "Spreading Flames",
    traits: ["Miskatonic"],
  },
  {
    id: "miskatonic-university-in-flames",
    name: "Miskatonic University (In Flames)",
    type: "location",
    shroud: 3,
    clues: 2,
    scenario: "Smoke and Mirrors",
    traits: ["Miskatonic"],
    notes: "Used if Miskatonic burned in Scenario I.",
  },
  {
    id: "miskatonic-university-quiet",
    name: "Miskatonic University (Quiet Campus)",
    type: "location",
    shroud: 2,
    clues: 2,
    scenario: "Smoke and Mirrors",
    traits: ["Miskatonic"],
    notes: "Used if Miskatonic was saved in Scenario I.",
  },
  // Scenario II — Smoke and Mirrors (Arkham city)
  {
    id: "northside",
    name: "Northside",
    type: "location",
    shroud: 3,
    clues: 1,
    scenario: "Smoke and Mirrors",
    traits: ["Arkham"],
  },
  {
    id: "downtown",
    name: "Downtown",
    type: "location",
    shroud: 3,
    clues: 2,
    scenario: "Smoke and Mirrors",
    traits: ["Arkham"],
    notes: "Two versions — one chosen randomly for each game.",
  },
  {
    id: "easttown",
    name: "Easttown",
    type: "location",
    shroud: 3,
    clues: 2,
    scenario: "Smoke and Mirrors",
    traits: ["Arkham"],
  },
  {
    id: "merchant-district",
    name: "Merchant District",
    type: "location",
    shroud: 3,
    clues: 1,
    scenario: "Smoke and Mirrors",
    traits: ["Arkham"],
  },
  {
    id: "waterfront-district",
    name: "Waterfront District",
    type: "location",
    shroud: 4,
    clues: 2,
    scenario: "Smoke and Mirrors",
    traits: ["Arkham"],
  },
  {
    id: "southside",
    name: "Southside",
    type: "location",
    shroud: 4,
    clues: 1,
    scenario: "Smoke and Mirrors",
    traits: ["Arkham"],
  },
  {
    id: "french-hill",
    name: "French Hill",
    type: "location",
    shroud: 4,
    clues: 2,
    scenario: "Smoke and Mirrors",
    traits: ["Arkham"],
  },
  {
    id: "uptown",
    name: "Uptown",
    type: "location",
    shroud: 3,
    clues: 1,
    scenario: "Smoke and Mirrors",
    traits: ["Arkham"],
    notes: "Two versions — one chosen randomly for each game.",
  },
  // Scenario III — Queen of Ash (Sewers)
  {
    id: "sewer-culvert",
    name: "Sewer Culvert",
    type: "location",
    shroud: 2,
    clues: 0,
    scenario: "Queen of Ash",
    traits: ["Sewer"],
    notes: "Starting location. Connects to all Sewer Tunnels.",
  },
  {
    id: "sewer-tunnels",
    name: "Sewer Tunnels",
    type: "location",
    shroud: 4,
    clues: 2,
    scenario: "Queen of Ash",
    traits: ["Sewer"],
    notes: "5 copies in play, unrevealed at start.",
  },
  {
    id: "underground-cistern",
    name: "Underground Cistern",
    type: "location",
    shroud: 5,
    clues: 3,
    scenario: "Queen of Ash",
    traits: ["Sewer"],
    notes: "Final location. Sluice Control set aside.",
  },
];

// -----------------------------------------------
// STORY ASSETS (campaign-persistent cards)
// -----------------------------------------------
export const STORY_ASSETS: CardEntry[] = [
  {
    id: "dr-henry-armitage",
    name: "Dr. Henry Armitage",
    type: "story-asset",
    scenario: "Spreading Flames",
    traits: ["Ally", "Miskatonic"],
    notes: "Earned in Scenario I resolution. Adds to bearer's deck, doesn't count toward deck size. Unique.",
  },
  {
    id: "mark-of-elokoss",
    name: "Mark of Elokoss",
    type: "story-asset",
    scenario: "Smoke and Mirrors",
    traits: ["Weakness", "Curse"],
    notes: "Weakness card. Set aside each copy during Smoke and Mirrors setup.",
  },
  {
    id: "collector-reward",
    name: "Collector",
    type: "story-asset",
    scenario: "Queen of Ash",
    traits: ["Reward"],
    notes: "Campaign reward for completing the campaign. 2 copies added to player card pool.",
  },
];

// -----------------------------------------------
// CODEX CHARACTERS (People of Arkham / suspects)
// -----------------------------------------------
export const CODEX_CHARACTERS: CardEntry[] = [
  {
    id: "david-renfield",
    name: "David Renfield",
    type: "story-enemy",
    fight: 0,
    evade: 3,
    health: 1,
    damage: 0,
    horror: 0,
    keywords: [],
    scenario: "Smoke and Mirrors",
    encounterSet: "People of Arkham",
    traits: ["Humanoid", "Suspect"],
    notes: "Codex 1. Flees when confronted — move to connecting location. May be harbinger of Elokoss.",
  },
  {
    id: "cornelia-akely",
    name: "Cornelia Akely",
    type: "story-enemy",
    fight: 0,
    evade: 2,
    health: 1,
    damage: 0,
    horror: 0,
    keywords: [],
    scenario: "Smoke and Mirrors",
    encounterSet: "People of Arkham",
    traits: ["Humanoid", "Suspect"],
    notes: "Codex 2. May be harbinger of Elokoss.",
  },
  {
    id: "naomi-obannion",
    name: "Naomi O'Bannion",
    type: "story-enemy",
    fight: 0,
    evade: 2,
    health: 1,
    damage: 1,
    horror: 0,
    keywords: [],
    scenario: "Smoke and Mirrors",
    encounterSet: "People of Arkham",
    traits: ["Humanoid", "Criminal", "Suspect"],
    notes: "Codex 3. Interrogate by defeating a non-Humanoid enemy at her location.",
  },
  {
    id: "sgt-earl-monroe",
    name: "Sgt. Earl Monroe",
    type: "story-enemy",
    fight: 3,
    evade: 2,
    health: 2,
    damage: 1,
    horror: 0,
    keywords: ["Retaliate"],
    scenario: "Smoke and Mirrors",
    encounterSet: "People of Arkham",
    traits: ["Humanoid", "Police", "Suspect"],
    notes: "Codex 4. Brandishes nightstick — you'll have to fight. May be harbinger of Elokoss.",
  },
  {
    id: "abigail-foreman",
    name: "Abigail Foreman",
    type: "story-enemy",
    fight: 0,
    evade: 1,
    health: 1,
    damage: 0,
    horror: 0,
    keywords: [],
    scenario: "Smoke and Mirrors",
    encounterSet: "People of Arkham",
    traits: ["Humanoid", "Miskatonic", "Suspect"],
    notes: "Codex 5. Junior librarian — approach with a card draw. May be harbinger of Elokoss.",
  },
  {
    id: "margaret-liu",
    name: "Margaret Liu",
    type: "story-enemy",
    fight: 0,
    evade: 2,
    health: 1,
    damage: 0,
    horror: 0,
    keywords: [],
    scenario: "Smoke and Mirrors",
    encounterSet: "People of Arkham",
    traits: ["Humanoid", "Suspect"],
    notes: "Codex 6. Lounge singer — look at top card of encounter deck to get her attention. May be harbinger of Elokoss.",
  },
];

// -----------------------------------------------
// ALL CARDS — combined lookup
// -----------------------------------------------
export const ALL_CARDS: CardEntry[] = [
  ...ENEMIES,
  ...LOCATIONS,
  ...STORY_ASSETS,
  ...CODEX_CHARACTERS,
];

// -----------------------------------------------
// SEARCH HELPER — used for autocomplete
// -----------------------------------------------
export function searchCards(
  query: string,
  filterTypes?: CardType[]
): CardEntry[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();
  return ALL_CARDS.filter((card) => {
    if (filterTypes && !filterTypes.includes(card.type)) return false;
    return (
      card.name.toLowerCase().includes(q) ||
      card.traits?.some((t) => t.toLowerCase().includes(q)) ||
      card.keywords?.some((k) => k.toLowerCase().includes(q)) ||
      card.encounterSet?.toLowerCase().includes(q)
    );
  }).slice(0, 10); // max 10 results
}

// -----------------------------------------------
// ENEMY PRESET HELPER
// When user picks an enemy from autocomplete,
// pre-fill the spawn form with these stats
// -----------------------------------------------
export function getEnemyPreset(cardId: string): {
  name: string;
  fightVal: number;
  evadeVal: number;
  health: number;
  damage: number;
  horror: number;
  keywords: string[];
} | null {
  const card = ALL_CARDS.find((c) => c.id === cardId);
  if (!card || (card.type !== "enemy" && card.type !== "story-enemy")) return null;
  return {
    name: card.name,
    fightVal: card.fight ?? 3,
    evadeVal: card.evade ?? 3,
    health: card.health ?? 3,
    damage: card.damage ?? 1,
    horror: card.horror ?? 1,
    keywords: card.keywords ?? [],
  };
}
