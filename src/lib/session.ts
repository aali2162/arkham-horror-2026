import { supabase } from "./supabase";
import { GameSession, GamePlayer, TurnState, ActionLogEntry } from "@/types";

// Generate a session code like AHCG-A3X7K
function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O, 1/I/L
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `AHCG-${code}`;
}

const DEFAULT_TURN_STATE: TurnState = {
  currentPlayerIdx: 0,
  actionsUsed: 0,
  round: 1,
  phase: "investigation",
  leadInvestigatorIdx: 0,
  doom: 0,
  doomThreshold: 3,
  agendaName: "Past Curfew",
  actName: "Where There Is Smoke…",
  cluesRequired: 2,
};

// ─── Session CRUD ────────────────────────────────────────────

export async function createSession(): Promise<GameSession | null> {
  const code = generateSessionCode();
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      session_code: code,
      turn_state: DEFAULT_TURN_STATE,
      action_log: [],
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    return null;
  }
  return data;
}

export async function getSessionByCode(code: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("session_code", code.toUpperCase())
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    return null;
  }
  return data;
}

// ─── Turn State ──────────────────────────────────────────────

export async function updateTurnState(
  sessionId: string,
  turnState: TurnState
): Promise<boolean> {
  const { error } = await supabase
    .from("game_sessions")
    .update({ turn_state: turnState, updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating turn state:", error);
    return false;
  }
  return true;
}

export async function appendActionLog(
  sessionId: string,
  currentLog: ActionLogEntry[],
  entry: ActionLogEntry
): Promise<boolean> {
  // Keep last 100 entries to avoid JSONB bloat
  const newLog = [entry, ...currentLog].slice(0, 100);
  const { error } = await supabase
    .from("game_sessions")
    .update({ action_log: newLog, updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    console.error("Error appending action log:", error);
    return false;
  }
  return true;
}

export async function updateActionLog(
  sessionId: string,
  log: ActionLogEntry[]
): Promise<boolean> {
  const { error } = await supabase
    .from("game_sessions")
    .update({ action_log: log, updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    console.error("Error updating action log:", error);
    return false;
  }
  return true;
}

// ─── Player CRUD ─────────────────────────────────────────────

export async function getPlayers(sessionId: string): Promise<GamePlayer[]> {
  const { data, error } = await supabase
    .from("game_players")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching players:", error);
    return [];
  }
  return data || [];
}

export async function addPlayer(
  sessionId: string,
  playerName: string,
  investigator: string
): Promise<GamePlayer | null> {
  const { data, error } = await supabase
    .from("game_players")
    .insert({
      session_id: sessionId,
      player_name: playerName,
      investigator,
      damage: 0,
      horror: 0,
      resources: 5,
      clues: 0,
      xp: 0,
      is_lead: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding player:", error);
    return null;
  }
  return data;
}

export async function removePlayer(playerId: string): Promise<boolean> {
  const { error } = await supabase
    .from("game_players")
    .delete()
    .eq("id", playerId);

  if (error) {
    console.error("Error removing player:", error);
    return false;
  }
  return true;
}

export async function updatePlayerStat(
  playerId: string,
  field: "damage" | "horror" | "resources" | "clues" | "xp",
  value: number
): Promise<boolean> {
  const { error } = await supabase
    .from("game_players")
    .update({ [field]: Math.max(0, value), updated_at: new Date().toISOString() })
    .eq("id", playerId);

  if (error) {
    console.error("Error updating player stat:", error);
    return false;
  }
  return true;
}

// ─── Real-time Subscriptions ─────────────────────────────────

export function subscribeToPlayers(
  sessionId: string,
  onUpdate: (players: GamePlayer[]) => void
) {
  const channel = supabase
    .channel(`players-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "game_players",
        filter: `session_id=eq.${sessionId}`,
      },
      () => {
        getPlayers(sessionId).then(onUpdate);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export function subscribeToSession(
  sessionId: string,
  onUpdate: (session: GameSession) => void
) {
  const channel = supabase
    .channel(`session-${sessionId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "game_sessions",
        filter: `id=eq.${sessionId}`,
      },
      (payload) => {
        onUpdate(payload.new as GameSession);
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
