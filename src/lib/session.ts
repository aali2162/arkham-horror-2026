import { supabase } from "./supabase";
import { GameSession, GamePlayer } from "@/types";

// Generate a session code like AHCG-A3X7K
function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O, 1/I/L
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `AHCG-${code}`;
}

// ─── Session CRUD ────────────────────────────────────────────

export async function createSession(): Promise<GameSession | null> {
  const code = generateSessionCode();
  const { data, error } = await supabase
    .from("game_sessions")
    .insert({ session_code: code })
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
      resources: 5, // standard starting resources
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
  field: "damage" | "horror" | "resources",
  value: number
): Promise<boolean> {
  const { error } = await supabase
    .from("game_players")
    .update({ [field]: Math.max(0, value), updated_at: new Date().toISOString() })
    .eq("id", playerId);

  if (error) {
    console.error("Error updating player:", error);
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
        // Re-fetch all players on any change for consistency
        getPlayers(sessionId).then(onUpdate);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
