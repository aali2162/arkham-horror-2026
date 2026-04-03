# 🔮 Arkham Horror 2026 — Interactive Learning Companion

A production-grade, beginner-friendly interactive learning website for **Arkham Horror: The Card Game (2026 Edition)**. Teaches complete game rules with zero assumed knowledge, featuring real-time multiplayer session tracking.

## Features

### 📖 Learn — Interactive Rules Database
- **4 Phase Pages** — Mythos, Investigation, Enemy, Upkeep — each with step-by-step breakdowns, definitions, worked examples, and edge cases
- **10 Action Detail Pages** — Every Investigation action (Draw, Gain Resource, Investigate, Move, Fight, Evade, Engage, Play Card, Activate Ability, Resign) with full process, examples, strategy tips, and keyword interactions
- **Skill Tests Guide** — The universal mechanic explained with the 5-step process, all chaos tokens, and complete worked examples
- **Damage & Trauma Guide** — Health, sanity, trauma, death, and insanity mechanics with investigator quick reference

### 🎮 Play — Real-time Session Tracking
- **Shareable Links** — Create a session, share the URL, everyone sees live updates
- **Session Codes** — `AHCG-XXXXX` format for easy sharing
- **Player Tracker** — Add players with investigator selection, track damage/horror/resources with +/− buttons
- **Real-time Sync** — Powered by Supabase real-time subscriptions; all browsers update instantly
- **Health/Sanity Bars** — Visual progress bars showing how close each investigator is to defeat

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Realtime) |
| Hosting | Vercel |

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/arkham-horror-2026.git
cd arkham-horror-2026
npm install
```

### 2. Configure Supabase (for Play session tracking)

Follow the complete guide in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md).

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** The Learn section works without Supabase. You only need it for Play sessions.

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Deploy to Vercel

```bash
# Option A: Via Vercel CLI
npm i -g vercel
vercel

# Option B: Via GitHub
# Push to GitHub, then import at vercel.com/new
```

Add your Supabase environment variables in Vercel's project settings → Environment Variables.

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                  # Homepage — topic grid
│   ├── learn/
│   │   ├── mythos/page.tsx       # Phase 1 detail
│   │   ├── investigation/
│   │   │   ├── page.tsx          # Phase 2 + 10 action cards
│   │   │   └── [action]/page.tsx # Dynamic action detail pages
│   │   ├── enemy/page.tsx        # Phase 3 detail
│   │   ├── upkeep/page.tsx       # Phase 4 detail
│   │   ├── skill-tests/page.tsx  # Skill test mechanic
│   │   └── damage/page.tsx       # Damage/horror/trauma
│   └── play/
│       ├── page.tsx              # Create/join session
│       └── [sessionCode]/page.tsx # Live session tracker
├── components/
│   ├── layout/Navbar.tsx         # Top nav with Learn/Play tabs
│   ├── learn/                    # DefinitionBox, ExampleBox, StepCard, etc.
│   └── play/                     # PlayerCard, AddPlayerForm
├── data/                         # Complete game rules database
│   ├── investigators.ts          # 5 investigators with stats
│   ├── phases.ts                 # 4 phase definitions
│   ├── actions.ts                # 10 action detail pages
│   ├── skillTests.ts             # Skill test process + chaos tokens
│   └── damage.ts                 # Damage/horror/trauma mechanics
├── lib/
│   ├── supabase.ts               # Supabase client
│   └── session.ts                # Session CRUD + real-time subscriptions
└── types/index.ts                # TypeScript interfaces
```

## Adding Content

### Add a new action
1. Add an entry to `src/data/actions.ts` following the `GameAction` interface
2. It automatically gets a detail page at `/learn/investigation/[id]`

### Add a new phase
1. Add to `src/data/phases.ts`
2. Create a page at `src/app/learn/[phase-name]/page.tsx`
3. Add a TopicCard to the homepage

## The Five Investigators

| Name | Class | Will | Int | Com | Agi | ♥ | 🧠 |
|------|-------|------|-----|-----|-----|---|---|
| Daniela Reyes | Guardian | 3 | 2 | 5 | 2 | 9 | 5 |
| Joe Diamond | Seeker | 2 | 4 | 4 | 2 | 7 | 7 |
| Trish Scarborough | Rogue | 2 | 4 | 2 | 4 | 8 | 6 |
| Dexter Drake | Mystic | 5 | 2 | 2 | 3 | 6 | 8 |
| Isabelle Barnes | Survivor | 4 | 2 | 3 | 3 | 9 | 5 |

## License

Built for personal use and board game nights. Arkham Horror: The Card Game is © Fantasy Flight Games.
