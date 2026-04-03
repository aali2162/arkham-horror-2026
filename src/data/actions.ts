import { GameAction } from "@/types";

export const actions: GameAction[] = [
  {
    id: "draw",
    number: 1,
    name: "Draw",
    icon: "🃏",
    tagline: "Take a card from your deck",
    description:
      "Spend 1 action to draw the top card of your investigator deck into your hand. Cards are your tools, weapons, allies, and tricks — you need them to survive. Your hand limit is 8 cards (enforced during Upkeep, not when you draw).",
    requirements: ["You have cards remaining in your deck"],
    steps: [
      { number: 1, instruction: "Spend 1 action" },
      { number: 2, instruction: "Take the top card from your investigator deck" },
      { number: 3, instruction: "Add it to your hand" },
    ],
    definitions: [
      { term: "Deck", meaning: "Your personal stack of cards, built before the scenario. You draw from the top." },
      { term: "Hand", meaning: "Cards you're holding. Not visible to other players. Maximum 8 cards (enforced in Upkeep)." },
      { term: "Hand Limit", meaning: "Maximum 8 cards in hand. If you exceed 8, discard down to 8 during Upkeep Phase." },
    ],
    example: {
      title: "Drawing a card",
      narrative: "You have 4 cards in hand and need weapons. Spend 1 action to draw — you get a .45 Automatic! Now you have 5 cards in hand. You still have 2 actions left this turn.",
    },
    edgeCases: [
      { question: "What if my deck is empty?", answer: "If you need to draw and your deck is empty, you take 1 horror instead. Running out of cards is very dangerous." },
      { question: "Can I look at the top card before drawing?", answer: "No. Drawing is blind — you take whatever is on top." },
      { question: "Can I draw more than once per turn?", answer: "Yes. You can spend all 3 actions drawing 3 cards if you want." },
    ],
    whenToUse: [
      "Your hand is low on cards (fewer than 3–4)",
      "You need specific tools (weapons, allies, skill cards) and want to dig for them",
      "Nothing urgent is happening — no enemies engaged, no clues to grab",
    ],
    specialInteractions: [
      "Joe Diamond draws 1 FREE card after successful investigation (doesn't cost an action)",
      "Some card abilities let you draw as a bonus effect",
    ],
  },
  {
    id: "gain-resource",
    number: 2,
    name: "Gain Resource",
    icon: "💰",
    tagline: "Collect 1 resource token",
    description:
      "Spend 1 action to take 1 resource token from the token pool. Resources are the currency you use to play cards from your hand. Most cards cost 1–3 resources. No resources = no new cards in play.",
    requirements: [],
    steps: [
      { number: 1, instruction: "Spend 1 action" },
      { number: 2, instruction: "Take 1 resource token from the supply" },
      { number: 3, instruction: "Add it to your resource pool" },
    ],
    definitions: [
      { term: "Resource", meaning: "The game's currency. Spent to play cards from your hand. Shown as a number in the top-left corner of each card." },
      { term: "Cost", meaning: "The number of resources you must spend to play a card. Printed in the top-left of the card. If you don't have enough, you can't play it." },
    ],
    example: {
      title: "Building up resources",
      narrative: "You have 0 resources and a great weapon in hand that costs 3 to play. Action 1: Gain Resource (now 1). Action 2: Gain Resource (now 2). Action 3: Gain Resource (now 3). Next turn, you can play that weapon!",
    },
    edgeCases: [
      { question: "Is there a maximum number of resources I can hold?", answer: "No. You can stockpile as many resources as you want." },
      { question: "Can other players give me resources?", answer: "Not by default. Some card abilities allow resource sharing, but normally your resources are yours alone." },
    ],
    whenToUse: [
      "You need to play an expensive card next turn",
      "You don't have any pressing threats to deal with right now",
      "You're saving up for a powerful combo",
    ],
    specialInteractions: [
      "Dexter Drake's ability can save resources by swapping assets instead of playing new ones",
      "Each player also gains 1 free resource during Upkeep Phase",
    ],
  },
  {
    id: "investigate",
    number: 3,
    name: "Investigate",
    icon: "🔎",
    tagline: "Search your location for clues",
    description:
      "The most important action in the game. You're searching your current location for hidden clues. This is a skill test: your Intellect vs the location's Shroud value. Success = discover 1 clue. Clues are how you advance the Act deck and win the scenario.",
    requirements: ["You must be at a location", "The location must have clues remaining"],
    steps: [
      { number: 1, instruction: "Check your current location", detail: "Look at the location card you're standing on. Note its Shroud value (difficulty) and how many clues are there." },
      { number: 2, instruction: "Begin Skill Test: Intellect vs Shroud", detail: "Your Intellect skill is tested against the location's Shroud number." },
      { number: 3, instruction: "Commit skill cards (optional)", detail: "Play cards from your hand with Intellect icons to boost your test. Each icon = +1." },
      { number: 4, instruction: "Draw a chaos token", detail: "Pull 1 token from the chaos bag. Apply its modifier to your skill value." },
      { number: 5, instruction: "Compare: Final Skill ≥ Shroud?", detail: "If your final value meets or beats the Shroud, you succeed and discover 1 clue. If not, you find nothing." },
    ],
    definitions: [
      { term: "Shroud", meaning: "The difficulty number printed on a location card. Higher Shroud = harder to find clues there. Example: Shroud 2 is easy, Shroud 4 is hard." },
      { term: "Intellect", meaning: "Your intelligence skill, printed on your investigator card. Used for investigation tests. Higher = better at finding clues." },
      { term: "Clue", meaning: "Tokens discovered at locations. Collecting enough clues advances the Act deck, progressing the story toward victory." },
      { term: "Act", meaning: "Story card representing your goals. Spend clues to advance it. Advancing Acts = winning." },
    ],
    example: {
      title: "Investigating the Library",
      narrative: "You're at Library (Shroud 2, 3 clues remaining). Your Intellect is 4. You commit 1 card with an Intellect icon (+1). Draw chaos token: +1. Final skill: 4 + 1 + 1 = 6. Is 6 ≥ 2? YES! You discover 1 clue. The Library now has 2 clues remaining.",
      breakdown: [
        "Base Intellect: 4",
        "Committed card: +1",
        "Chaos token: +1",
        "Total: 6 vs Shroud 2",
        "Result: SUCCESS — discover 1 clue",
      ],
    },
    edgeCases: [
      { question: "Can I investigate the same location twice?", answer: "Yes — as long as it still has clues. You can spend all 3 actions investigating." },
      { question: "What if an enemy is at my location?", answer: "You still investigate the location, not the enemy. Enemies don't block investigation. However, if an enemy is engaged with you and you try to do anything other than Fight/Evade/Parley/Resign, the enemy gets an Attack of Opportunity." },
      { question: "What happens if I fail?", answer: "Nothing bad happens (usually). You just don't get a clue. Your action is wasted but you're unharmed. You can try again." },
      { question: "What if there are no clues left at my location?", answer: "You can't investigate a location with 0 clues. Move somewhere else." },
    ],
    whenToUse: [
      "Your location has clues — this is usually your top priority",
      "You have high Intellect (3+) and the Shroud is manageable",
      "You need clues to advance the Act and progress the story",
      "No enemies are threatening you (or you've evaded them)",
    ],
    specialInteractions: [
      "Joe Diamond (Seeker) draws 1 card after successful investigation — limit once per round",
      "Flashlight asset reduces Shroud by 1 for the test",
      "Some locations have special investigation rules in their text",
    ],
  },
  {
    id: "move",
    number: 4,
    name: "Move",
    icon: "🚶",
    tagline: "Walk to a connected location",
    description:
      "Spend 1 action to move your investigator from their current location to one connected location. The map shows which locations are connected by lines. You can only move one location per action — use multiple Move actions for longer distances.",
    requirements: ["There must be a connected location to move to"],
    steps: [
      { number: 1, instruction: "Spend 1 action" },
      { number: 2, instruction: "Check the map for connected locations", detail: "Lines between locations show valid connections." },
      { number: 3, instruction: "Move your investigator to the chosen connected location" },
      { number: 4, instruction: "Check for Attacks of Opportunity", detail: "If you were engaged with an enemy, that enemy attacks you as you leave (unless you evaded first)." },
    ],
    definitions: [
      { term: "Connected", meaning: "Two locations linked by a line on the scenario map. You can only move between connected locations." },
      { term: "Attack of Opportunity (AoO)", meaning: "When you take an action other than Fight, Evade, Resign, or Parley while engaged with an enemy, that enemy attacks you for free. Moving away triggers this." },
    ],
    example: {
      title: "Moving through locations",
      narrative: "You're at the Hallway, connected to Library and Study. Action 1: Move to Library. Action 2: Investigate the Library. Action 3: Investigate again. Efficient turn — moved once, investigated twice.",
    },
    edgeCases: [
      { question: "What if an enemy is engaged with me when I move?", answer: "The enemy gets an Attack of Opportunity — it attacks you once for free as you leave. The enemy does NOT exhaust from this attack. You still move to the new location, but the enemy may follow (if Hunter) or stay behind." },
      { question: "Can I move through multiple locations in one action?", answer: "No. Each Move action takes you exactly 1 connected location. To cross 3 locations, you need 3 Move actions." },
      { question: "Do enemies follow me when I move?", answer: "Only Hunter enemies pursue you (they move during Enemy Phase). Non-Hunter enemies stay where they are." },
    ],
    whenToUse: [
      "You need to reach a location with clues",
      "You need to escape a dangerous location",
      "You need to join another player to help them",
      "You need to reach a specific story location",
    ],
    specialInteractions: [
      "Evading an enemy before moving prevents the Attack of Opportunity",
      "Some card abilities allow free movement (doesn't cost an action)",
      "Resign action also moves you — out of the scenario entirely",
    ],
    keywords: [
      { name: "Attack of Opportunity", effect: "Engaged enemies attack when you try to leave. Deals damage. Enemy does NOT exhaust." },
    ],
  },
  {
    id: "fight",
    number: 5,
    name: "Fight",
    icon: "⚔️",
    tagline: "Attack an engaged enemy",
    description:
      "Attack an enemy that's engaged with you. This is a skill test: your Combat vs the enemy's Fight value. Success = you deal damage equal to your base Combat value (or weapon damage). Reduce the enemy's health — when its damage equals or exceeds its health, it's defeated and removed.",
    requirements: ["An enemy must be engaged with you"],
    steps: [
      { number: 1, instruction: "Choose an engaged enemy to attack" },
      { number: 2, instruction: "Begin Skill Test: Combat vs Fight value", detail: "Your Combat skill is tested against the enemy's Fight number." },
      { number: 3, instruction: "Commit skill cards (optional)", detail: "Play cards with Combat icons for +1 each." },
      { number: 4, instruction: "Draw a chaos token" },
      { number: 5, instruction: "Compare: Final Skill ≥ Fight value?", detail: "Success = deal damage. Failure = no damage dealt." },
      { number: 6, instruction: "Deal damage on success", detail: "Place damage tokens on the enemy equal to your Combat value (or weapon damage). When total damage ≥ enemy health, enemy is defeated." },
    ],
    definitions: [
      { term: "Fight Value", meaning: "The difficulty number on an enemy card for combat. Higher = harder to hit. You test your Combat against this number." },
      { term: "Combat", meaning: "Your fighting skill on your investigator card. Used for Fight tests. Higher = better fighter." },
      { term: "Damage", meaning: "Tokens placed on an enemy when you successfully hit it. When damage ≥ health, the enemy is defeated and removed from play." },
      { term: "Health (Enemy)", meaning: "How much damage an enemy can take before being defeated. Printed on the enemy card." },
    ],
    example: {
      title: "Fighting a Ghoul",
      narrative: "A Ghoul is engaged with you (Fight 3, Health 3). Your Combat is 5. You commit 1 Combat skill card (+1). Draw chaos token: −1. Final: 5 + 1 − 1 = 5. Is 5 ≥ 3? YES! You deal damage equal to your Combat (5). The Ghoul had 3 health. 5 damage ≥ 3 health — Ghoul defeated! Remove it from play.",
      breakdown: [
        "Base Combat: 5",
        "Committed card: +1",
        "Chaos token: −1",
        "Total: 5 vs Fight 3",
        "Result: SUCCESS — deal 5 damage, Ghoul defeated (3 health)",
      ],
    },
    edgeCases: [
      { question: "What if I deal more damage than the enemy's health?", answer: "Excess damage is wasted. It doesn't carry over to other enemies." },
      { question: "What if I don't kill it in one hit?", answer: "Damage stays on the enemy between rounds. A 5-health enemy with 3 damage only needs 2 more to defeat. Keep fighting!" },
      { question: "Can I fight an enemy not engaged with me?", answer: "No. You must be engaged with the enemy to Fight it. Use the Engage action first if needed." },
      { question: "What happens on failure?", answer: "No damage is dealt. If the enemy has the Retaliate keyword, it attacks you in response." },
    ],
    whenToUse: [
      "An enemy is engaged with you and threatening your survival",
      "Your Combat is high enough to reliably hit the enemy",
      "The enemy is blocking your investigation (triggering AoO)",
      "You're the team's fighter (Daniela, Joe have good Combat)",
    ],
    specialInteractions: [
      "Daniela Reyes can Fight an enemy as a reaction when it attacks someone at her location (free, limit once/round)",
      "Weapons (asset cards) can increase your Combat or deal extra damage",
      "Some enemies have Retaliate — they attack you if you fail the Fight test",
    ],
    keywords: [
      { name: "Retaliate", effect: "If you fail a Fight test against this enemy, it attacks you immediately. Punishes failed attacks." },
    ],
  },
  {
    id: "evade",
    number: 6,
    name: "Evade",
    icon: "💨",
    tagline: "Slip away from an engaged enemy",
    description:
      "Attempt to escape an enemy engaged with you. Skill test: your Agility vs the enemy's Evade value. Success = the enemy exhausts (tips sideways) and won't attack this round during the Enemy Phase. The enemy is still at your location but temporarily neutralized.",
    requirements: ["An enemy must be engaged with you"],
    steps: [
      { number: 1, instruction: "Choose an engaged enemy to evade" },
      { number: 2, instruction: "Begin Skill Test: Agility vs Evade value" },
      { number: 3, instruction: "Commit skill cards (optional)", detail: "Play cards with Agility icons for +1 each." },
      { number: 4, instruction: "Draw a chaos token" },
      { number: 5, instruction: "Compare: Final Skill ≥ Evade value?", detail: "Success = enemy exhausts. Failure = enemy stays ready." },
    ],
    definitions: [
      { term: "Evade Value", meaning: "The difficulty number on an enemy card for escaping. You test your Agility against this." },
      { term: "Agility", meaning: "Your evasion skill on your investigator card. Higher = better at escaping enemies." },
      { term: "Exhaust", meaning: "Tipping a card sideways. Exhausted enemies don't attack during Enemy Phase. They ready again during Upkeep." },
    ],
    example: {
      title: "Evading a Vampire",
      narrative: "A Vampire is engaged with you (Evade 3). Your Agility is 4. You commit 1 Agility card (+1). Draw chaos token: −1. Final: 4 + 1 − 1 = 4. Is 4 ≥ 3? YES! The Vampire exhausts. It won't attack during this round's Enemy Phase. But during Upkeep, it readies again — you'll need to deal with it next round.",
    },
    edgeCases: [
      { question: "Does evading kill the enemy?", answer: "No. Evading only exhausts the enemy temporarily. It's still at your location and will ready next Upkeep." },
      { question: "Can I move away after evading?", answer: "Yes! Evade first, then Move — since the enemy is exhausted, you avoid the Attack of Opportunity." },
      { question: "What if I fail the evade?", answer: "The enemy stays ready and will attack you during Enemy Phase as normal. If the enemy has the Alert keyword, it attacks you immediately on a failed evade." },
    ],
    whenToUse: [
      "You can't win the fight (low Combat vs high Fight value)",
      "You have high Agility (Trish Scarborough is perfect for this)",
      "You want to avoid taking damage this round",
      "You need to move away safely (evade first, then move)",
      "You're buying time for teammates to help",
    ],
    specialInteractions: [
      "Trish Scarborough can take 1 additional Evade action per turn for free",
      "Evading before moving prevents Attack of Opportunity",
      "Alert keyword: failed evasion = enemy attacks you immediately",
    ],
    keywords: [
      { name: "Alert", effect: "If you fail an Evade test against this enemy, it attacks you immediately — even though you tried to run." },
    ],
  },
  {
    id: "engage",
    number: 7,
    name: "Engage",
    icon: "🎯",
    tagline: "Pull an enemy to fight you",
    description:
      "Pull an unengaged enemy at your location to engage with you. This makes the enemy your problem — it's now fighting you specifically. You can't attack an unengaged enemy, so Engage is sometimes necessary before you can Fight.",
    requirements: ["An unengaged enemy must be at your location"],
    steps: [
      { number: 1, instruction: "Spend 1 action" },
      { number: 2, instruction: "Choose an unengaged enemy at your location" },
      { number: 3, instruction: "That enemy is now engaged with you" },
    ],
    definitions: [
      { term: "Unengaged", meaning: "An enemy at a location but not currently fighting anyone. It's just lurking there." },
      { term: "Engaged", meaning: "An enemy actively fighting you. Required before you can attack it." },
    ],
    example: {
      title: "Engaging a lurking Cultist",
      narrative: "A Cultist is at the Library but unengaged (maybe it was evaded by another player). You're the team's fighter. Action 1: Engage the Cultist — it's now fighting you. Action 2: Fight the Cultist. Action 3: Fight again to finish it off.",
    },
    edgeCases: [
      { question: "When would I voluntarily engage an enemy?", answer: "When you're the team's best fighter and want to protect a teammate. Or when an enemy is unengaged and blocking the location — engage it so you can kill it." },
      { question: "Can I engage an enemy at a different location?", answer: "No. The enemy must be at your current location." },
    ],
    whenToUse: [
      "You need to fight an unengaged enemy (can't fight without engaging first)",
      "You want to protect a teammate by pulling the enemy to yourself",
      "An enemy was evaded and is now unengaged — re-engage to finish it off",
    ],
    specialInteractions: [
      "Daniela Reyes is great at engaging enemies — her high Combat makes her a natural tank",
      "If you engage an enemy, it will attack you during Enemy Phase (if ready)",
    ],
  },
  {
    id: "play-card",
    number: 8,
    name: "Play Card",
    icon: "🎴",
    tagline: "Put a card from your hand into play",
    description:
      "Spend 1 action and the card's resource cost to play a card from your hand. Asset cards stay in play on the table, giving you ongoing abilities. Event cards resolve their effect immediately and then go to the discard pile.",
    requirements: ["You have enough resources to pay the card's cost", "You have a valid target (if the card requires one)"],
    steps: [
      { number: 1, instruction: "Choose a card from your hand" },
      { number: 2, instruction: "Pay its resource cost", detail: "Spend resources equal to the number in the card's top-left corner." },
      { number: 3, instruction: "Place it in play (assets) or resolve it (events)", detail: "Assets stay on the table. Events happen once then go to discard." },
    ],
    definitions: [
      { term: "Asset", meaning: "A card that stays in play on the table. Provides ongoing abilities, stats, or actions you can use each turn. Examples: weapons, allies, tools." },
      { term: "Event", meaning: "A card that resolves its effect once and then goes to the discard pile. One-time use." },
      { term: "Fast", meaning: "Cards marked 'Fast' don't cost an action to play. You can play them anytime, even during other players' turns." },
      { term: "Cost", meaning: "Resources you spend to play the card. Shown in top-left corner. If you can't pay, you can't play." },
    ],
    example: {
      title: "Playing a weapon",
      narrative: "You have 3 resources and a .45 Automatic in hand (cost 3). Action 1: Play .45 Automatic — spend 3 resources, place it on the table in front of you. It's now an asset giving you +1 Combat and dealing +1 damage on successful attacks. You still have 2 actions to fight with it!",
    },
    edgeCases: [
      { question: "Can I play a card with 0 cost?", answer: "Yes! Some cards are free. You still spend 1 action to play them (unless they're Fast)." },
      { question: "What about Fast cards?", answer: "Fast cards don't cost an action. Play them anytime — during your turn, other players' turns, even during the Enemy Phase. They still cost resources." },
      { question: "What if I don't have enough resources?", answer: "You can't play the card. Gain Resources first, or wait until you can afford it." },
    ],
    whenToUse: [
      "You have a useful card in hand and enough resources to play it",
      "You need to set up for future turns (weapons, allies, tools)",
      "You have a powerful Event card that solves an immediate problem",
    ],
    specialInteractions: [
      "Dexter Drake can swap an asset when he plays a new one — returning a non-story asset to hand or chaining into a second asset play (limit once/round)",
      "Some cards have play restrictions (e.g., 'Play only during your turn')",
    ],
  },
  {
    id: "activate-ability",
    number: 9,
    name: "Activate Ability",
    icon: "⚡",
    tagline: "Use a power on a card in play",
    description:
      "Use a special ability printed on a card that's already in play (on the table in front of you). These abilities have the action symbol (→) meaning they cost 1 action to use. Some are very powerful but can only be used once per round.",
    requirements: ["You have a card in play with an action ability", "The card is ready (not exhausted)"],
    steps: [
      { number: 1, instruction: "Choose a card in play with an action ability" },
      { number: 2, instruction: "Spend 1 action" },
      { number: 3, instruction: "Pay any additional costs listed", detail: "Some abilities also cost resources, exhausting the card, or other costs." },
      { number: 4, instruction: "Resolve the ability's effect" },
    ],
    definitions: [
      { term: "Action Ability", meaning: "A power on a card marked with the action arrow symbol (→). Costs 1 action to use. Generally limit once per round per card." },
      { term: "Exhaust Cost", meaning: "Some abilities require exhausting (tipping sideways) the card as part of the cost. The card can't be used again until it readies in Upkeep." },
    ],
    example: {
      title: "Using an Ally's ability",
      narrative: "You have a Research Librarian ally in play with the ability: '→ Exhaust: Test Intellect (2). If you succeed, draw 1 card.' Action 1: Activate the Librarian — exhaust it, test Intellect vs 2, succeed, draw 1 card. The Librarian is now exhausted and can't be used again until Upkeep readies it.",
    },
    edgeCases: [
      { question: "Can I use an ability on an exhausted card?", answer: "Only if the ability doesn't require exhausting as a cost. If it says 'Exhaust:' before the effect, the card must be ready." },
      { question: "Can I use multiple different abilities in one turn?", answer: "Yes — as long as each costs a separate action and you have actions to spend. Different cards can each be activated." },
    ],
    whenToUse: [
      "Your card in play has a powerful ability that helps right now",
      "You need the specific effect the ability provides (draw cards, deal damage, heal, etc.)",
      "The ability gives you more value than a basic action would",
    ],
    specialInteractions: [
      "Some abilities are free (triggered/reaction) and don't cost actions — these happen in response to specific events",
      "Allies often have powerful action abilities that are worth building around",
    ],
  },
  {
    id: "parley",
    number: 10,
    name: "Parley",
    icon: "🗣️",
    tagline: "Negotiate with an enemy instead of fighting",
    description:
      "Attempt to resolve an encounter with an enemy through words, bribery, or deception rather than violence. Parley is a special action that only works when a card, location, or scenario rule explicitly offers it — you can't Parley just any enemy. When available, it lets you test a skill (usually Willpower or Intellect) against the enemy. Success means the enemy is pacified, bypassed, or removed without combat.",
    requirements: [
      "A card, location, or scenario rule must explicitly allow Parley against this enemy",
      "The enemy must be at your location",
    ],
    steps: [
      { number: 1, instruction: "Check if Parley is allowed", detail: "Look for 'Parley' text on the enemy card, your location, or an active scenario rule. Without this, you cannot attempt Parley." },
      { number: 2, instruction: "Spend 1 action" },
      { number: 3, instruction: "Perform the skill test listed", detail: "The card or scenario specifying Parley will also name the skill tested and the difficulty. Common tests: Willpower, Intellect, or Agility." },
      { number: 4, instruction: "Apply the result", detail: "Success: the enemy is pacified, removed, or the Parley effect resolves as described. Failure: the Parley fails — the enemy remains and will attack as normal." },
    ],
    definitions: [
      { term: "Parley", meaning: "A special action allowing you to negotiate or interact non-violently with an enemy. Only available when a card or scenario rule specifically grants it. Counts as a valid action while engaged (no AoO)." },
      { term: "Pacify", meaning: "When an enemy is pacified via Parley, it may be exhausted, removed from play, or have its threat neutralized — as described by the card or scenario that granted the Parley option." },
    ],
    example: {
      title: "Talking your way past a Cultist",
      narrative: "A Cultist enemy card says: 'Parley: Test Willpower (3). If successful, discard this enemy.' You're engaged with the Cultist. Your Willpower is 4. Action 1: Parley — test Willpower (4) vs difficulty 3. You draw a chaos token: +0. Total: 4 ≥ 3 — Success! The Cultist is discarded. You avoided the fight entirely and saved actions and health.",
    },
    edgeCases: [
      { question: "Does Parley count as a 'safe' action while engaged?", answer: "Yes! Parley is one of the four 'safe' actions while engaged (along with Fight, Evade, and Resign). Taking the Parley action does NOT trigger an Attack of Opportunity." },
      { question: "Can I Parley any enemy?", answer: "No. You can only Parley when a card, location, or scenario rule explicitly says you may. Most enemies have no Parley option — you must fight or evade them." },
      { question: "What if Parley fails?", answer: "The enemy remains engaged and will attack during the Enemy Phase as normal. You've spent an action with no benefit. Some enemies may have extra penalties for failed Parley — check the card text." },
      { question: "Can Parley replace fighting entirely in a scenario?", answer: "Some scenarios are designed with Parley-heavy solutions — certain suspects or cultists can be fully resolved through Parley. The Brethren of Ash campaign has some of these moments." },
    ],
    whenToUse: [
      "The enemy card or your location has 'Parley' text — always read it first",
      "Your combat stats are low but your Willpower/Intellect are high",
      "You want to resolve an enemy without spending multiple fight actions",
      "You're low on health and want to avoid taking damage",
    ],
    specialInteractions: [
      "Dexter Drake and Isabelle Barnes have high Willpower, making Parley tests easier",
      "Parley does NOT exhaust the enemy or deal damage — it resolves or removes it outright on success",
      "Some scenario enemies can ONLY be resolved through Parley (not defeatable by damage)",
    ],
  },
  {
    id: "resign",
    number: 11,
    name: "Resign",
    icon: "🚪",
    tagline: "Leave the scenario voluntarily",
    description:
      "Voluntarily leave the scenario. You're removed from play and don't participate further. Unlike being defeated, resigning does NOT give you trauma. However, you can only resign when a card ability specifically allows it — you can't just quit whenever you want.",
    requirements: ["A card ability must currently allow you to resign (usually a location or story card says 'Resign' as an option)"],
    steps: [
      { number: 1, instruction: "Confirm a resign option is available", detail: "Check if your location or an active card says you may Resign." },
      { number: 2, instruction: "Spend 1 action to Resign" },
      { number: 3, instruction: "Remove your investigator from play", detail: "You're out for the rest of this scenario." },
    ],
    definitions: [
      { term: "Resign", meaning: "Voluntarily leaving the scenario. No trauma penalty. Only available when a card specifically offers it." },
      { term: "Defeated", meaning: "Being removed by running out of health or sanity. DOES give trauma. Much worse than resigning." },
      { term: "Trauma", meaning: "Permanent penalty that carries through the entire campaign. Physical trauma = start with damage. Mental trauma = start with horror." },
    ],
    example: {
      title: "A strategic retreat",
      narrative: "The scenario is going badly. You've found 4 of 6 needed clues but your health is at 1 and a powerful enemy just appeared. Your location card says: 'Resign: An investigator at this location may resign.' You spend 1 action to Resign. You're safe — no trauma. The other players continue without you.",
    },
    edgeCases: [
      { question: "Can I resign whenever I want?", answer: "No. A card must specifically offer the Resign action. Usually specific locations or story effects grant it." },
      { question: "What happens to the scenario when I resign?", answer: "Other players continue playing. If all players resign or are defeated, the scenario ends (usually with a worse resolution)." },
      { question: "Is resigning bad?", answer: "It's better than being defeated (no trauma). But the team loses your help. It's a tactical decision — sometimes the right call." },
    ],
    whenToUse: [
      "You're about to die (health or sanity nearly gone) and death would give permanent trauma",
      "You've done everything you can and want to protect your investigator for future scenarios",
      "The scenario is lost and there's no reason to keep fighting",
    ],
    specialInteractions: [
      "Resigning counts as being removed from play — any ongoing effects end",
      "Assets and cards you control are removed with you",
      "Your clues are typically placed at your location for other players",
    ],
  },
];
