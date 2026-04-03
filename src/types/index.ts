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

// --- Play Session: Campaign / Scenario ---
export interface ScenarioConfig {
  id: string;
  name: string;
  agendaName: string;
  actName: string;
  doomThreshold: number;
  cluesRequired: number;
}

export interface CampaignConfig {
  id: string;
  name: string;
  subtitle: string;
  scenarios: ScenarioConfig[];
}

// --- Play Session: Turn State (synced via Supabase) ---
export interface TurnState {
  currentPlayerIdx: number;
  actionsUsed: number;
  round: number;
  phase: "mythos" | "investigation" | "enemy" | "upkeep";
  leadInvestigatorIdx: number;
  doom: number;
  doomThreshold: number;
  agendaName: string;
  actName: string;
  cluesRequired: number;
  cluesOnAct?: number;  // clues investigators have committed to the act (spending toward advance)
  // lobby — game hasn't started until lead clicks "Start Game"
  gameStarted?: boolean;
  // campaign tracking
  campaignId?: string;
  scenarioId?: string;
  scenarioNumber?: number;       // 1-indexed act number within scenario
  // player turn order (array of player IDs)
  playerOrder?: string[];
  // scenario complete flag
  scenarioComplete?: boolean;
  // scenario ended by lead (with resolution text)
  scenarioEnded?: boolean;
  scenarioResolution?: string;
  // enemies synced to all devices
  enemies?: EnemyState[];
}

export interface EnemyState {
  id: string;
  name: string;
  fightVal: number;
  evadeVal: number;
  health: number;
  damage: number;   // damage it deals per attack
  horror: number;   // horror it deals per attack
  currentDamage: number;
  keywords: string[];
  engagedPlayerIds: string[];  // array — supports Massive (multiple) and normal (one)
  exhausted: boolean;
}

export interface ActionLogEntry {
  id: string;
  playerName: string;
  investigator: string;
  action: string;
  detail: string;
  timestamp: string; // ISO string for JSON serialisation
  round: number;
  actionNum: number;
  phase: TurnState["phase"];
}

// --- Play Session (Supabase) ---
export interface GameSession {
  id: string;
  session_code: string;
  turn_state: TurnState;
  action_log: ActionLogEntry[];
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
  clues: number;
  xp: number;
  is_lead: boolean;
  created_at: string;
  updated_at: string;
}

// --- Navigation ---
export type TabId = "learn" | "play";
