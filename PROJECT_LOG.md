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

## CURRENT STATUS (Updated: April 2, 2026 — DEPLOYED)

### Live URL: https://arkham-horror-2026.vercel.app

### ✅ COMPLETED
- [x] Full Next.js 14 + TypeScript + Tailwind CSS codebase (39 files)
- [x] All 4 phase detail pages (Mythos, Investigation, Enemy, Upkeep)
- [x] All 10 action detail pages (Draw, Gain Resource, Investigate, Move, Fight, Evade, Engage, Play Card, Activate Ability, Resign)
- [x] Skill Tests detail page (5-step process, all 12 chaos tokens)
- [x] Damage/Horror/Trauma detail page with investigator reference
- [x] Play Session hub (create/join sessions)
- [x] Real-time player tracker (damage/horror/resources with +/- buttons)
- [x] Supabase project "Game Train" created (ca-central-1 region)
- [x] Database schema applied (game_sessions + game_players tables)
- [x] Row Level Security + real-time replication enabled
- [x] Local dev server confirmed working (localhost:3000)
- [x] .env.local configured with Supabase credentials
- [x] Pushed to GitHub (github.com/aali2162/arkham-horror-2026)
- [x] Deployed to Vercel — https://arkham-horror-2026.vercel.app
- [x] Build verified: 22 pages, 0 errors, all routes generated

### 🔲 NOT YET DONE
- [ ] Add Supabase env vars to Vercel project settings (NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Test real-time sync across multiple browsers
- [ ] Test session creation and player tracking end-to-end
- [ ] Mobile responsiveness testing
- [ ] Test real-time sync across multiple browsers
- [ ] Test session creation and player tracking end-to-end
- [ ] Mobile responsiveness testing
- [ ] Campaign/scenario tracking (Brethren of Ash: 3 scenarios)
- [ ] Investigator detail pages (5 investigators with full abilities)
- [ ] Chaos bag simulator / practice tool
- [ ] Round tracker integration in Play session
- [ ] XP tracking between scenarios
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

### 10 Investigation Actions
1. Draw, 2. Gain Resource, 3. Investigate, 4. Move, 5. Fight, 6. Evade, 7. Engage, 8. Play Card, 9. Activate Ability, 10. Resign

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
| `/learn/investigation` | Phase 2: Investigation + 10 action grid | ✅ Built |
| `/learn/investigation/draw` | Action 1: Draw | ✅ Built |
| `/learn/investigation/gain-resource` | Action 2: Gain Resource | ✅ Built |
| `/learn/investigation/investigate` | Action 3: Investigate | ✅ Built |
| `/learn/investigation/move` | Action 4: Move | ✅ Built |
| `/learn/investigation/fight` | Action 5: Fight | ✅ Built |
| `/learn/investigation/evade` | Action 6: Evade | ✅ Built |
| `/learn/investigation/engage` | Action 7: Engage | ✅ Built |
| `/learn/investigation/play-card` | Action 8: Play Card | ✅ Built |
| `/learn/investigation/activate-ability` | Action 9: Activate Ability | ✅ Built |
| `/learn/investigation/resign` | Action 10: Resign | ✅ Built |
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
