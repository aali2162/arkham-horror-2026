# Supabase Setup Guide

Complete setup for the real-time player session tracking. Takes ~5 minutes.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in (free tier works)
2. Click **New Project**
3. Choose an organization, name it `arkham-horror-2026`
4. Set a database password (save it somewhere safe)
5. Choose a region close to you
6. Click **Create new project** and wait ~2 minutes

## Step 2: Get Your API Keys

1. In your Supabase dashboard, go to **Project Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://abc123.supabase.co`)
   - **anon public key** (a long JWT string)

3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Create the Database Tables

Go to **SQL Editor** in your Supabase dashboard and run this entire script:

```sql
-- ============================================
-- ARKHAM HORROR 2026 — DATABASE SCHEMA
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Game Sessions ───────────────────────────

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast session code lookups
CREATE INDEX idx_session_code ON game_sessions(session_code);

-- ─── Game Players ────────────────────────────

CREATE TABLE game_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  investigator TEXT NOT NULL,
  damage INTEGER NOT NULL DEFAULT 0,
  horror INTEGER NOT NULL DEFAULT 0,
  resources INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching players by session
CREATE INDEX idx_players_session ON game_players(session_id);

-- ─── Auto-update timestamps ──────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_timestamp
  BEFORE UPDATE ON game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_players_timestamp
  BEFORE UPDATE ON game_players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ──────────────────────
-- Open access for this app (no auth required)

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;

-- Allow all operations (session-code-based access, no auth)
CREATE POLICY "Allow all on sessions" ON game_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on players" ON game_players
  FOR ALL USING (true) WITH CHECK (true);
```

Click **Run** — you should see "Success" for each statement.

## Step 4: Enable Real-time

1. In Supabase dashboard, go to **Database** → **Replication**
2. Under **Supabase Realtime**, ensure `game_players` table has replication enabled
3. If not, click the toggle for `game_players` to enable it

Alternatively, run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
```

## Step 5: Verify

1. Start the dev server: `npm run dev`
2. Go to `/play` and click **Create Session**
3. You should see a session code like `AHCG-X7K3M`
4. Add a player — they should appear immediately
5. Open the same URL in another browser tab
6. Change damage/horror/resources — both tabs should update in real-time

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to create session" | Check `.env.local` has correct URL and key |
| Session created but no real-time | Enable replication for `game_players` (Step 4) |
| CORS errors | Make sure you're using the `anon` key, not `service_role` |
| Players not showing | Check RLS policies are created (the SQL script handles this) |

## Optional: Clean Up Old Sessions

Run this periodically to remove sessions older than 7 days:

```sql
DELETE FROM game_sessions
WHERE created_at < NOW() - INTERVAL '7 days';
```

Players are auto-deleted due to `ON DELETE CASCADE`.
