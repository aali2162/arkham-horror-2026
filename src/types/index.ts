// ============================================
// ARKHAM HORROR 2026 — TYPE DEFINITIONS
// ============================================

// --- Investigators ---
export interface Investigator {
  name: string;
  class: string;
  willpower: number;
  intellect: number;
  combat: number;
  agility: number;
  health: number;
  sanity: number;
  ability: string;
  abilityDetail: string;
  elderSign: string;
}

// --- Game Phases ---
export interface Phase {
  id: string;
  number: number;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  steps: PhaseStep[];
  definitions: Definition[];
  edgeCases: EdgeCase[];
  example?: string;
}

export interface PhaseStep {
  number: number;
  title: string;
  detail: string;
}

export interface Definition {
  term: string;
  meaning: string;
}

export interface EdgeCase {
  question: string;
  answer: string;
}

// --- Actions (Phase 2 sub-pages) ---
export interface GameAction {
  id: string;
  number: number;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  requirements: string[];
  steps: ActionStep[];
  definitions: Definition[];
  example: ActionExample;
  edgeCases: EdgeCase[];
  whenToUse: string[];
  specialInteractions: string[];
  keywords?: ActionKeyword[];
}

export interface ActionStep {
  number: number;
  instruction: string;
  detail?: string;
}

export interface ActionExample {
  title: string;
  narrative: string;
  breakdown?: string[];
}

export interface ActionKeyword {
  name: string;
  effect: string;
}

// --- Skill Tests ---
export interface SkillTestData {
  steps: SkillTestStep[];
  skills: SkillInfo[];
  chaosTokens: ChaosToken[];
  example: ActionExample;
}

export interface SkillTestStep {
  number: number;
  title: string;
  detail: string;
}

export interface SkillInfo {
  name: string;
  icon: string;
  usedFor: string;
}

export interface ChaosToken {
  name: string;
  modifier: string;
  description: string;
}

// --- Damage / Horror / Trauma ---
export interface DamageData {
  sections: DamageSection[];
}

export interface DamageSection {
  id: string;
  title: string;
  icon: string;
  description: string;
  definitions: Definition[];
  example: string;
  details: string[];
}

// --- Play Session (Supabase) ---
export interface GameSession {
  id: string;
  session_code: string;
  created_at: string;
  updated_at: string;
}

export interface GamePlayer {
  id: string;
  session_id: string;
  player_name: string;
  investigator: string;
  damage: number;
  horror: number;
  resources: number;
  created_at: string;
  updated_at: string;
}

// --- Navigation ---
export type TabId = "learn" | "play";
