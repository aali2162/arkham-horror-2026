# GAME TRAIN — PROJECT LOG
## Arkham Horror 2026 Interactive Learning Companion

> **Purpose of this file:** This is the living project document. Add it to a Claude Project so any new conversation has full context. Update it as the project evolves.

---

## PROJECT IDENTITY

- **Project Name:** Game Train
- **First Product:** Arkham Horror: The Card Game (2026 Edition) — Interactive Learning Companion
- **Vision:** Scale to other board games (Dune: Imperium, Escape the Dark Sector, etc.) and sell as digital products via Payhip/Gumroad/Sellfy targeting GTA SMBs
- **Owner:** Ahsan (GTA, Ontario, Canada)
- **Players:** Ahsan, his wife (Tania), and friends

---

## CURRENT STATUS (Updated: April 3, 2026 — Session 11 COMPLETE)

### Live URL: https://arkham-horror-2026.vercel.app
### Last commit: `650aa5e` — "feat: 6 UX fixes — lobby/start game, turn order setup, view board toggle, Game Train rebrand, Inter font overhaul, improved text contrast"
### Session 11 changes — FULL PARCHMENT REDESIGN (pending deploy — run deploy.ps1):
**End-to-end Full Parchment visual overhaul — Option A selected by Ahsan:**
- **Homepage (page.tsx)**: removed all hardcoded dark `#161008`/`#0f0c07` backgrounds; hero, step cards, investigator cards, play CTA, footer all now warm parchment `#ecdcb0`/`#f2e8cc`
- **TopicCard**: replaced dark gradient card bg with parchment `#ecdcb0`, gold border `#c8a860`, colour accent top bar per investigator class
- **Session page (play/[sessionCode]/page.tsx)**: bulk-replaced all `rgba(26,20,16,...)`, `#0e0b06`, `#1e1710`, `#3d3020` dark backgrounds/borders with parchment equivalents; modal backdrop overlays kept dark (intentional)
- **Learn components**: DefinitionBox, ExampleBox, EdgeCaseBox, StepCard — all text/bg updated to parchment ink colours
- **globals.css**: fixed `.ark-prose p` text colour (was dark `#a89878`), `.ornate-border` bg, `.stat-pill` bg
- **deploy.ps1**: updated commit message to Session 11

### Session 10 changes (deployed):
**Visual overhaul — matched to official rulebook:**
- **Fonts**: replaced Inter (generic) with Cinzel Decorative (titles) + Cinzel (headings/buttons) + Crimson Text (body) + IM Fell English (flavour text) — matches the rulebook's gothic/classical serif aesthetic
- **Colour palette**: shifted from cold blue-black (`#0a0805`) to warm deep sepia (`#0e0b06`, `#1e1710`) — matches the rulebook's candlelight/parchment warmth
- **Class colours**: corrected to exact rulebook quick-reference values — Guardian blue `#4a8fd4`, Seeker amber `#c8871a`, Mystic purple `#7050b8`, Rogue green `#2e8a50`, Survivor red `#b82020`
- **Skill colours**: Willpower purple `#9070d8`, Intellect amber `#c8871a`, Combat red `#c03028`, Agility green `#2e8a50`
- **All SVG icons rebuilt**: Willpower=raised fist, Intellect=open book, Combat=clenched fist with knuckles, Agility=running figure with speed lines, Wild=question mark in circle, Doom=skull face, Clue=concentric circle token, Resource=hexagonal cube, new DamageIcon (red hexagon/heart), new HorrorIcon (blue hexagon/brain)
- **Phase colours**: Mythos purple, Investigation amber, Enemy red, Upkeep teal — all matching rulebook card border colours
- **Chaos tokens**: colours matched to physical token photography in rulebook
- **Action colours**: each action now uses its associated class/skill colour
- **Enemy attack fixed:** "⚔ Attacks!" button now actually applies `enemy.damage` to damage and `enemy.horror` to horror for every engaged investigator via `updatePlayerStat`. Previously only logged, never hurt anyone.
- **Attack button UX:** disabled (greyed) when no one is engaged or enemy is exhausted; tooltip shows exact damage preview; glows red during Enemy phase
- **Non-lead reminder:** engaged investigators see a passive reminder strip showing what the enemy deals per attack
- **Exhaust button** relabelled from "Exhaust — Evaded / ✓ Ready (Upkeep)" to cleaner "Exhaust / ✓ Ready"
- **Shroud picker on Investigate:** tap 1–5 to set location difficulty; colour-coded green/amber/red; auto-fills detail field
- **Smart identity on game start:** creator auto-claimed as first player; all other devices get a mandatory full-screen "Who are you?" picker the moment game starts
- **Enemy carryover fix:** `handleAdvanceScenario` now clears `enemies`, resets `cluesOnAct`, clears `scenarioEnded`/`scenarioResolution`
- **Advance Act gating:** button disabled (greyed, tooltip) until `cluesOnAct >= cluesRequired`
- **Ready All Enemies:** Upkeep phase shows "✓ Ready All Enemies" button (lead only) when any enemy is exhausted — readies all + logs
- **Audit confirmed:** Doom pips (`disabled={!isLead}`), all phase buttons inside `{isLead && (...)}`, clue pips interactive for all players

### Session 8 changes (deployed):
- Latecomer join screen: game started + not in session → clean "Join the Game" screen (not overwhelmed by board)
- Undo last action button next to End Turn on YOUR TURN screen
- Advance Scenario button (alongside Advance Act) — only shown when a campaign is selected
- Brethren of Ash scenarios fixed: Spreading Flames / Smoke and Mirrors / Queen of Ash with corrected doom thresholds
- Log management: delete individual log entries (✕ hover on each entry)
- Clue tracker checkpoint in doom bar: shows total clues across party vs cluesRequired, pulses when ready to advance act
- Editable round number (lead only) — click to fix incorrect round number
- Investigator stat preview (HP, SAN, WIL, INT, COM, AGI) shown when adding player in lobby or join screen
- `updateActionLog()` added to session.ts for direct log overwriting
- `gameStarted` flag added to DEFAULT_TURN_STATE (already existed in TurnState type)

### ✅ COMPLETED
- [x] Full Next.js 14 + TypeScript + Tailwind CSS codebase
- [x] **Session 6 UX overhaul:**
  - Lobby/setup screen — add up to 4 players, set turn order BEFORE game starts
  - Start Game button — game only begins when lead clicks it, no accidental takeover
  - View Board toggle on YOUR TURN overlay — can peek at full board mid-turn, then return
  - Game Train rebranding — site is the platform, Arkham Horror is the first game within it
  - Font overhaul: replaced Playfair Display with Inter across all pages (cleaner, more readable)
  - Improved text contrast: muted text brightened from #5a4a38 → #8a8278
- [x] All 4 phase detail pages (Mythos, Investigation, Enemy, Upkeep)
- [x] All 11 action detail pages (Draw, Gain Resource, Investigate, Move, Fight, Evade, Engage, Play Card, Activate Ability, **Parley**, Resign)
- [x] Skill Tests detail page (5-step process, all 12 chaos tokens)
- [x] Damage/Horror/Trauma detail page with investigator reference
- [x] PhaseNav component — smooth in-page phase switcher on all phase pages
- [x] Full rules audit — AoO obligation, Aloof/Massive/Patrol/Elusive keywords, Treachery, Upkeep costs, all enemy movement rules
- [x] Play Session hub (create/join sessions) — with session recovery (last session stored in localStorage, rejoin banner)
- [x] **Multiplayer Play Session — complete overhaul (Session 4+5):**
  - Per-device identity via localStorage (each player on their own phone)
  - Real-time sync via Supabase (both `game_players` and `game_sessions`)
  - YOUR TURN full-screen takeover with 3-action flow + End Turn button
  - Action selection → confirmation modal → auto-log → advance action count
  - **Learn links:** each action confirmation has "📖 Learn more →" link to `/learn/investigation/[action]` (new tab)
  - Lead investigator manages Mythos/Enemy/Upkeep phases with quick-log buttons
  - Doom tracker, agenda/act names, clue threshold (lead-only editable, free text)
  - **Campaign/scenario picker:** lead selects Night of the Zealot or Brethren of Ash scenario — auto-fills doom threshold, agenda, act, clues
  - **Act advancement tracker:** "Act 1/2/3" shown in Doom bar; lead has "Advance Act →" button
  - **Turn order reordering:** lead toggles "⇅ Reorder Turn" to drag ↑/↓ player order; synced via `playerOrder` in TurnState
  - **Identity onboarding:** pulsing amber "Tap to identify yourself →" banner auto-appears until player identifies
  - Delete player functionality (✕ button with confirm)
  - Clue + XP tracking per player
  - Rulebook-accurate SVG symbols (ActionSymbol, skill icons, DoomIcon, ClueIcon, ResourceIcon)
  - Enemy tracker tab with keyword guide, HP tracking, AoO warnings on player cards
  - Action log tab (per-player, per-round, real-time)
  - Reference tab (round structure, skill icons, token types, chaos bag, easily missed rules)
- [x] Supabase project "Game Train" created (ca-central-1 region)
- [x] Database schema: game_sessions (with turn_state JSONB + action_log JSONB) + game_players
- [x] Row Level Security + real-time replication enabled
- [x] Deployed to Vercel — https://arkham-horror-2026.vercel.app

### TurnState fields (all synced via Supabase JSONB):
`currentPlayerIdx`, `actionsUsed`, `round`, `phase`, `leadInvestigatorIdx`, `doom`, `doomThreshold`, `agendaName`, `actName`, `cluesRequired`, `campaignId?`, `scenarioId?`, `scenarioNumber?`, `playerOrder?`, `scenarioComplete?`

### 🔲 NOT YET DONE
- [ ] Test real-time sync across multiple devices end-to-end
- [ ] Mobile responsiveness testing
- [ ] End-of-scenario flow (record XP, advance to next scenario, export summary PDF)
- [ ] Investigator detail pages (5 investigators with full abilities)
- [ ] Chaos bag simulator / practice tool
- [ ] Polish: loading states, error boundaries, animations

---

## TECH STACK

| Layer | Technology | Details |
|-------|-----------|---------|
| Framework | Next.js 14 | App Router, React Server Components |
| Language | TypeScript | Strict mode |
| Styling | Tailwind CSS | Custom dark Lovecraftian theme |
| Backend | Supabase | PostgreSQL + Realtime subscriptions |
| Hosting | Vercel | (not yet deployed) |
| Fonts | Playfair Display + Source Sans 3 + JetBrains Mono | Loaded via Google Fonts CDN |

---

## SUPABASE CONFIGURATION

- **Project Name:** Game Train
- **Project ID:** `etkmpjioayiqpsjruqre`
- **Region:** `ca-central-1` (Montreal — closest to GTA)
- **URL:** `https://etkmpjioayiqpsjruqre.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0a21wamlvYXlpcXBzanJ1cXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNDY2ODQsImV4cCI6MjA5MDcyMjY4NH0.-kazRGVLbNZNml6bVOIuVJwfIXh_08yllQEI3EsKLGQ`
- **Organization ID:** `obyqzjvcsarjibsfyzcd`
- **Database:** PostgreSQL 17.6.1

### Database Schema

**game_sessions**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| session_code | TEXT (unique) | Format: AHCG-XXXXX |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

**game_players**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| session_id | UUID (FK) | References game_sessions.id, CASCADE delete |
| player_name | TEXT | |
| investigator | TEXT | One of 5 investigators |
| damage | INTEGER | Default 0 |
| horror | INTEGER | Default 0 |
| resources | INTEGER | Default 5 |
| created_at | TIMESTAMPTZ | Auto |
| updated_at | TIMESTAMPTZ | Auto-updated via trigger |

- RLS enabled on both tables with open access policies (no auth required)
- Real-time replication enabled on `game_players`
- Auto-update timestamp triggers on both tables

---

## LOCAL FILE STRUCTURE

```
C:\Users\alix4\Game Train\arkham-horror-2026\
├── .env.local                          ← Supabase credentials (DO NOT commit)
├── .gitignore
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── README.md
├── SUPABASE_SETUP.md
├── PROJECT_LOG.md                      ← THIS FILE
├── src/
│   ├── app/
│   │   ├── globals.css                 ← Tailwind + custom theme + glow effects
│   │   ├── layout.tsx                  ← Root layout with metadata
│   │   ├── page.tsx                    ← Homepage (hero + 6 topic cards)
│   │   ├── learn/
│   │   │   ├── page.tsx                ← Redirects to /
│   │   │   ├── mythos/page.tsx         ← Phase 1 detail
│   │   │   ├── investigation/
│   │   │   │   ├── page.tsx            ← Phase 2 + 10 action cards grid
│   │   │   │   └── [action]/page.tsx   ← Dynamic action detail (all 10)
│   │   │   ├── enemy/page.tsx          ← Phase 3 detail
│   │   │   ├── upkeep/page.tsx         ← Phase 4 detail
│   │   │   ├── skill-tests/page.tsx    ← Skill test mechanic
│   │   │   └── damage/page.tsx         ← Damage/horror/trauma
│   │   └── play/
│   │       ├── page.tsx                ← Create/join session hub
│   │       └── [sessionCode]/page.tsx  ← Live session tracker
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx              ← Top nav with Learn/Play tabs
│   │   ├── learn/
│   │   │   ├── BackButton.tsx
│   │   │   ├── DefinitionBox.tsx       ← Blue left-border info box
│   │   │   ├── EdgeCaseBox.tsx         ← Amber Q&A box
│   │   │   ├── ExampleBox.tsx          ← Green worked-example box
│   │   │   ├── StepCard.tsx            ← Numbered step with circle
│   │   │   └── TopicCard.tsx           ← Homepage grid card
│   │   └── play/
│   │       ├── AddPlayerForm.tsx       ← Name + investigator dropdown
│   │       └── PlayerCard.tsx          ← Stat controls + health/sanity bars
│   ├── data/
│   │   ├── investigators.ts            ← 5 investigators with full stats + abilities
│   │   ├── phases.ts                   ← 4 phases with steps/definitions/examples/edge cases
│   │   ├── actions.ts                  ← 10 actions with full detail page content
│   │   ├── skillTests.ts              ← 5-step process + 4 skills + 12 chaos tokens
│   │   └── damage.ts                   ← 3 sections (damage/horror/trauma)
│   ├── lib/
│   │   ├── supabase.ts                 ← Supabase client singleton
│   │   └── session.ts                  ← CRUD + real-time subscriptions
│   └── types/
│       └── index.ts                    ← All TypeScript interfaces
```

---

## DESIGN SYSTEM

### Theme: Dark Lovecraftian
- Dark backgrounds with subtle blue/purple ambient glows
- Cards with borders that lighten on hover
- Color-coded content boxes (blue=definition, green=example, amber=edge case, red=warning)

### Colors (Tailwind: ark-*)
| Token | Hex | Usage |
|-------|-----|-------|
| ark-bg | #0c0f14 | Page background |
| ark-surface | #161b24 | Input/secondary backgrounds |
| ark-card | #1c2230 | Card backgrounds |
| ark-border | #2a3245 | Default borders |
| ark-blue | #4a9eff | Primary accent, links, CTAs |
| ark-green | #34d399 | Success, examples |
| ark-red | #f87171 | Damage, danger |
| ark-amber | #fbbf24 | Warnings, edge cases |
| ark-purple | #a78bfa | Horror, mystical |
| ark-text | #e8ecf4 | Primary text |
| ark-text-dim | #8896ab | Secondary text |
| ark-text-muted | #5a6a80 | Tertiary text |

### Fonts
- **Display:** Playfair Display (headings, titles)
- **Body:** Source Sans 3 (paragraphs, UI text)
- **Mono:** JetBrains Mono (codes, formulas, chaos tokens)

### Component Library
- `.card` — bg-ark-card, border, rounded-xl, hover lift
- `.definition-box` — blue-glow bg, blue left border
- `.example-box` — green-glow bg, green left border
- `.edge-case-box` — amber bg, amber left border
- `.step-number` — 40px blue circle with number
- `.glow-blue/green/red/purple` — ambient box shadows

---

## GAME RULES DATA (embedded in src/data/)

### 5 Investigators
| Name | Class | Will | Int | Com | Agi | HP | San |
|------|-------|------|-----|-----|-----|----|-----|
| Daniela Reyes | Guardian | 3 | 2 | 5 | 2 | 9 | 5 |
| Joe Diamond | Seeker | 2 | 4 | 4 | 2 | 7 | 7 |
| Trish Scarborough | Rogue | 2 | 4 | 2 | 4 | 8 | 6 |
| Dexter Drake | Mystic | 5 | 2 | 2 | 3 | 6 | 8 |
| Isabelle Barnes | Survivor | 4 | 2 | 3 | 3 | 9 | 5 |

### Round Structure
Phase 1 (Mythos) → Phase 2 (Investigation) → Phase 3 (Enemy) → Phase 4 (Upkeep) → repeat
- Round 1 SKIPS Mythos Phase

### 11 Investigation Actions
1. Draw, 2. Gain Resource, 3. Investigate, 4. Move, 5. Fight, 6. Evade, 7. Engage, 8. Play Card, 9. Activate Ability, 10. Parley, 11. Resign

### Brethren of Ash Campaign (3 Scenarios)
1. Spreading Flames — Your Friend's Room start
2. Smoke and Mirrors — 6 suspects, interrogate or fight
3. Queen of Ash — Sewer map, 3 clue entry to Underground Cistern

---

## ROUTING MAP

| Route | Page | Status |
|-------|------|--------|
| `/` | Homepage — hero + 6 topic cards | ✅ Built |
| `/learn/mythos` | Phase 1: Mythos | ✅ Built |
| `/learn/investigation` | Phase 2: Investigation + 11 action grid | ✅ Built |
| `/learn/investigation/draw` | Action 1: Draw | ✅ Built |
| `/learn/investigation/gain-resource` | Action 2: Gain Resource | ✅ Built |
| `/learn/investigation/investigate` | Action 3: Investigate | ✅ Built |
| `/learn/investigation/move` | Action 4: Move | ✅ Built |
| `/learn/investigation/fight` | Action 5: Fight | ✅ Built |
| `/learn/investigation/evade` | Action 6: Evade | ✅ Built |
| `/learn/investigation/engage` | Action 7: Engage | ✅ Built |
| `/learn/investigation/play-card` | Action 8: Play Card | ✅ Built |
| `/learn/investigation/activate-ability` | Action 9: Activate Ability | ✅ Built |
| `/learn/investigation/parley` | Action 10: Parley | ✅ Built |
| `/learn/investigation/resign` | Action 11: Resign | ✅ Built |

| `/learn/enemy` | Phase 3: Enemy | ✅ Built |
| `/learn/upkeep` | Phase 4: Upkeep | ✅ Built |
| `/learn/skill-tests` | Skill Tests mechanic | ✅ Built |
| `/learn/damage` | Damage/Horror/Trauma | ✅ Built |
| `/play` | Create/Join session hub | ✅ Built |
| `/play/[sessionCode]` | Live session tracker | ✅ Built |

---

## REMAINING DEPLOYMENT STEPS

### GitHub + Vercel (automated — run deploy.ps1)

A fully automated PowerShell script `deploy.ps1` is in the project root. It:
1. Initializes git + commits all files
2. Creates the GitHub repo via `gh` CLI (`gh` must be installed + authenticated)
3. Installs Vercel CLI if needed
4. Deploys to Vercel with both Supabase env vars pre-configured
5. Outputs your live `.vercel.app` URL

**To run:**
```powershell
# In Windows Terminal / PowerShell, from project root:
cd "C:\Users\alix4\Game Train\arkham-horror-2026"
.\deploy.ps1
```

**Prerequisites:**
- GitHub CLI: `winget install GitHub.cli` then `gh auth login`
- Node.js already installed (confirmed v24.14.0)

**Manual fallback (if gh CLI unavailable):**
1. Create empty repo at github.com (name: `arkham-horror-2026`, no README)
2. Run git commands manually, then go to vercel.com/new
3. Import GitHub repo, add the two NEXT_PUBLIC env vars from .env.local
4. Deploy

---

## FUTURE FEATURES (BACKLOG)

### Phase 2 Features
- [ ] Investigator detail pages with full ability breakdowns
- [ ] Campaign tracker (scenario progress, resolutions, XP)
- [ ] Round counter in Play session
- [ ] Doom tracker in Play session
- [ ] Chaos bag simulator (draw tokens, see probabilities)
- [ ] Scenario setup guides (Spreading Flames, Smoke and Mirrors, Queen of Ash)
- [ ] Print-friendly quick reference sheet

### Phase 3 — Multi-Game Platform ("Game Train")
- [ ] Add Escape the Dark Sector rules + session tracking
- [ ] Add Dune: Imperium rules + session tracking
- [ ] Game selection homepage
- [ ] Monetization via Payhip/Gumroad digital products
- [ ] Custom domain (gametrain.app or similar)

---

## HOW TO ADD CONTENT

### Add a new action to Phase 2
1. Open `src/data/actions.ts`
2. Add an object following the `GameAction` interface
3. It auto-generates a page at `/learn/investigation/[id]`

### Add a new phase/topic
1. Add data to `src/data/phases.ts`
2. Create `src/app/learn/[new-topic]/page.tsx`
3. Add a TopicCard entry in `src/app/page.tsx`

### Add a new investigator
1. Add to `src/data/investigators.ts` following the `Investigator` interface
2. Automatically appears in the Play session investigator dropdown

---

## CONVERSATION HISTORY SUMMARY

**Chat 1 (April 2, 2026) — Full Build Session:**
- Built complete 39-file Next.js codebase from PROJECT_SPECIFICATION.md
- Created Supabase project "Game Train" via MCP
- Applied database migration (game_sessions + game_players)
- Enabled real-time replication
- Retrieved API keys and configured .env.local
- Walked through local setup on Windows (node v24.14.0)
- Resolved file path issues (zip extracted to subfolder)
- Confirmed local dev server running at localhost:3000

**Chat 2 (April 3, 2026) — Rules Audit + Phase Nav + Play Overhaul:**
- Created PhaseNav component (smooth in-page 4-tab phase navigator)
- Added PhaseNav to all 4 phase pages (Mythos, Investigation, Enemy, Upkeep)
- Full rulebook rules audit: AoO obligation (engage = must Fight/Evade/Parley/Resign), red warning banner on investigation page, Step 3 in phases.ts; Aloof/Massive/Patrol/Elusive enemy keywords; Treachery definition; Upkeep costs; non-Hunter enemy movement rule
- Added Parley as Action 10 (full detail page content); Resign renumbered to 11
- Updated action count references throughout (10 → 11)
- Complete multiplayer Play Session overhaul: per-device identity, YOUR TURN takeover, action selection flow, Lead phase management, doom/clue tracking, delete player, rulebook SVG icons
- Updated TurnState, ActionLogEntry, GameSession, GamePlayer types
- Added updateTurnState, appendActionLog, subscribeToSession to session.ts
