import { Phase } from "@/types";

export const phases: Phase[] = [
  {
    id: "mythos",
    number: 1,
    name: "Mythos Phase",
    tagline: "The world grows darker",
    icon: "🌑",
    color: "purple",
    description:
      "The Mythos Phase is the game's countdown timer. Doom accumulates on the Agenda card, enemies move closer, and encounter cards throw obstacles at you. This phase is automatic — you don't make choices, you just endure it. Round 1 skips this phase entirely; you start with Investigation.",
    steps: [
      {
        number: 1,
        title: "Place 1 Doom on Agenda",
        detail:
          "Take 1 doom token and place it on the current Agenda card. Doom accumulates each round — it's the game's clock ticking down. Every doom token brings you one step closer to the Agenda advancing.",
      },
      {
        number: 2,
        title: "Check Doom vs Threshold",
        detail:
          'Compare the total doom on the Agenda to its printed threshold number. If doom ≥ threshold, the Agenda advances: remove ALL doom, flip to the next Agenda card. The story gets worse and the game gets harder. If doom < threshold, nothing happens — you have more time.',
      },
      {
        number: 3,
        title: "Draw Encounter Cards",
        detail:
          "Each player draws 1 card from the encounter deck and resolves it immediately. Encounter cards are always bad: Treachery cards impose harmful effects, Enemy cards spawn creatures you must fight, and Hazard cards create dangerous conditions. You cannot save or store encounter cards — they must be resolved right away.",
      },
    ],
    definitions: [
      {
        term: "Doom",
        meaning:
          "Countdown tokens placed on the Agenda card each round. When doom reaches the threshold, the Agenda advances and things get worse. Think of it as a ticking bomb.",
      },
      {
        term: "Threshold",
        meaning:
          'The target number printed on the Agenda card. Example: "Advance when doom ≥ 5" means the Agenda flips after 5 doom tokens accumulate.',
      },
      {
        term: "Agenda",
        meaning:
          "A story card representing the current threat. It shows a doom threshold and narrative text. When the Agenda advances, the story progresses — usually making things much harder for you.",
      },
      {
        term: "Encounter Card",
        meaning:
          "A card drawn from the encounter deck during Mythos. Always bad. Types include Treachery (instant harmful effect), Enemy (creature spawns), and Hazard (ongoing danger).",
      },
      {
        term: "Treachery",
        meaning:
          "An encounter card type that imposes an immediate harmful effect on the investigator who drew it — tests, damage, horror, or ongoing conditions. Goes to discard after resolving.",
      },
    ],
    edgeCases: [
      {
        question: "What if doom is already past the threshold from a previous effect?",
        answer:
          "The Agenda advances immediately when doom ≥ threshold, regardless of when that condition is met. If a card effect adds doom mid-phase and pushes it over, the Agenda advances right then.",
      },
      {
        question: "What happens to the old Agenda when it advances?",
        answer:
          "ALL doom is removed from the advancing Agenda. The old Agenda is flipped or replaced with the next Agenda in the sequence. Read the new Agenda's setup text carefully — it may add enemies, change map conditions, or apply immediate effects.",
      },
      {
        question: "Round 1 skips Mythos — does that mean no doom is placed?",
        answer:
          "Correct. In Round 1 only, you skip the entire Mythos Phase. No doom is placed, no encounter cards are drawn. You go straight to Investigation Phase.",
      },
      {
        question: "What if an encounter card spawns an enemy — does it engage me immediately?",
        answer:
          "If the enemy spawns at your location, it engages you immediately. If it spawns at a different location, it is unengaged there. Hunter enemies will begin pursuing you during the next Enemy Phase.",
      },
      {
        question: "Does each player draw their own encounter card?",
        answer:
          "Yes. Each investigator draws and resolves their own encounter card separately during Mythos. Some scenario abilities modify this.",
      },
    ],
    example:
      'Agenda has threshold 5. Currently 3 doom tokens on it. Mythos Phase begins: place 1 doom → now 4 doom. Is 4 ≥ 5? No. Nothing happens. Each player draws an encounter card — Player 1 draws a Treachery (takes 1 horror), Player 2 draws an Enemy card (a Ghoul spawns at their location). Next round: place 1 doom → now 5 doom. Is 5 ≥ 5? YES! Remove all doom, flip Agenda to side B. Read the new terrible thing that happens.',
  },
  {
    id: "investigation",
    number: 2,
    name: "Investigation Phase",
    tagline: "Your turn to act",
    icon: "🔍",
    color: "blue",
    description:
      "This is YOUR phase — the one where you make decisions and take actions. Each player gets exactly 3 actions per round. You can use them in any order, repeat the same action, or use fewer than 3. There are 11 possible actions to choose from. Critical rule: if you are engaged with an enemy, taking any action other than Fight, Evade, Parley, or Resign will trigger a free Attack of Opportunity from that enemy.",
    steps: [
      {
        number: 1,
        title: "Players Take Turns",
        detail:
          "Starting with the lead investigator and going clockwise, each player takes their entire turn (all 3 actions) before the next player goes.",
      },
      {
        number: 2,
        title: "Spend Up to 3 Actions",
        detail:
          "On your turn, you have 3 action points. Each action you take costs 1 point. Choose from the 11 available actions. You can repeat the same action multiple times (e.g., Move three times). Unused actions are lost — they don't carry over.",
      },
      {
        number: 3,
        title: "Engaged Enemy Rule — Critical!",
        detail:
          'If you are engaged with an enemy and you take any action other than Fight, Evade, Parley, or Resign — that enemy immediately performs an Attack of Opportunity (AoO) against you. This attack deals damage and horror as printed on the enemy card, and the enemy does NOT exhaust from this. You can take as many non-Fight/Evade actions as you want, but each one triggers a separate AoO. Plan accordingly!',
      },
      {
        number: 4,
        title: "Resolve Fast Cards",
        detail:
          'Cards marked "Fast" can be played at any time, even during other players\' turns or between actions, without spending an action. They still cost resources.',
      },
    ],
    definitions: [
      {
        term: "Action",
        meaning:
          "One of your 3 action points per turn. You spend actions to do things: investigate, fight, move, play cards, etc.",
      },
      {
        term: "Fast",
        meaning:
          "A keyword on some cards meaning they don't cost an action to play. You can play them anytime, even during other players' turns. They still cost resources.",
      },
      {
        term: "Lead Investigator",
        meaning:
          "The first player each round. Goes first during Investigation Phase. Chosen at start of scenario. Breaks ties and makes group decisions.",
      },
      {
        term: "Attack of Opportunity (AoO)",
        meaning:
          "When you are engaged with an enemy and take any action other than Fight, Evade, Parley, or Resign, the engaged enemy immediately deals its attack damage/horror to you — for free, without exhausting. This happens once per such action taken.",
      },
      {
        term: "Engaged",
        meaning:
          "An enemy is engaged with you when it's at your location and actively fighting you. Engaged enemies trigger AoO and attack during the Enemy Phase.",
      },
    ],
    edgeCases: [
      {
        question: "Can I use fewer than 3 actions?",
        answer:
          "Yes. You can use 0, 1, 2, or 3 actions on your turn. Unused actions are simply lost — they don't carry over.",
      },
      {
        question: "Can I take the same action multiple times?",
        answer:
          "Yes. You could Investigate 3 times, or Move twice then Fight once, or any combination.",
      },
      {
        question: "I'm engaged with an enemy. Can I still Investigate?",
        answer:
          "Yes, but the enemy gets an Attack of Opportunity — it deals its damage/horror to you for free before you investigate. You still investigate after taking that hit. If you want to avoid it, Fight or Evade the enemy first.",
      },
      {
        question: "Does the AoO exhaust the enemy?",
        answer:
          "No. The enemy does NOT exhaust from an Attack of Opportunity. It can still attack you again during the Enemy Phase in the same round.",
      },
      {
        question: "Can I react to what other players do on their turns?",
        answer:
          'Only with Fast cards or specific reaction abilities (marked with a reaction icon). Otherwise, you wait until your own turn to act.',
      },
      {
        question: "What if multiple enemies are engaged with me?",
        answer:
          "All of them get an Attack of Opportunity when you take a non-fight/evade/parley/resign action. Each engaged enemy makes a separate attack.",
      },
    ],
    example:
      "It's your turn. A Ghoul is engaged with you. You have 3 actions. Action 1: Evade the Ghoul (Agility vs Evade — success, Ghoul exhausts). Action 2: Move from Hallway to Library (safe — Ghoul is exhausted so no AoO). Action 3: Investigate the Library. Clean, efficient turn — you dealt with the enemy, moved, and grabbed a clue.",
  },
  {
    id: "enemy",
    number: 3,
    name: "Enemy Phase",
    tagline: "They strike back",
    icon: "👹",
    color: "red",
    description:
      "The Enemy Phase is automatic — enemies act on their own without you making choices. First, Hunter enemies move toward investigators. Then, every ready enemy that is engaged with an investigator attacks. You just take the hits — there's no dodge here. This is the consequence of leaving enemies alive.",
    steps: [
      {
        number: 1,
        title: "Hunter Enemies Move",
        detail:
          'Enemies with the "Hunter" keyword move 1 location toward the nearest investigator (by number of connections). If two investigators are equidistant, the lead investigator chooses which one the Hunter pursues. If a Hunter reaches an investigator\'s location, it immediately engages them. If a Hunter is already at a location with investigators, it engages but does not move.',
      },
      {
        number: 2,
        title: "Unengaged Enemies at Investigator Locations Engage",
        detail:
          "Any enemy that is at the same location as an investigator but is currently unengaged will automatically engage that investigator. If multiple investigators are at the same location as an unengaged enemy, the lead investigator decides who it engages.",
      },
      {
        number: 3,
        title: "Engaged Enemies Attack",
        detail:
          "Each enemy that is BOTH engaged with an investigator AND ready (not exhausted) attacks once. The investigator takes the damage and/or horror printed on the enemy card. The enemy does NOT exhaust from a normal attack — it stays ready to attack again next round unless you evade it.",
      },
    ],
    definitions: [
      {
        term: "Hunter",
        meaning:
          "A keyword on some enemies. Hunter enemies move 1 location toward the nearest investigator at the start of the Enemy Phase. They're actively pursuing you.",
      },
      {
        term: "Engaged",
        meaning:
          "An enemy actively fighting a specific investigator. Engaged enemies attack during the Enemy Phase and trigger Attacks of Opportunity.",
      },
      {
        term: "Ready",
        meaning:
          "A card that is upright and active. Ready enemies can attack. Ready assets can be used.",
      },
      {
        term: "Exhausted",
        meaning:
          "A card tipped sideways. Exhausted enemies don't attack during the Enemy Phase. Cards ready during Upkeep Phase.",
      },
      {
        term: "Aloof",
        meaning:
          "Enemies with Aloof do NOT automatically engage investigators. They must be specifically engaged using the Engage action. Until engaged, they lurk at the location without attacking.",
      },
      {
        term: "Massive",
        meaning:
          "Enemies with Massive are so large they engage ALL investigators at their location simultaneously. Each investigator at that location is engaged with the Massive enemy at the same time.",
      },
      {
        term: "Patrol",
        meaning:
          "Enemies with Patrol move between specific locations each round (specified on the card or scenario sheet), rather than pursuing the nearest investigator like Hunter does.",
      },
      {
        term: "Elusive",
        meaning:
          "Enemies with Elusive begin the scenario unengaged and in the threat area, not at a location. They only engage when specific conditions are met.",
      },
    ],
    edgeCases: [
      {
        question: "What if a Hunter is already at my location?",
        answer:
          "It doesn't move — it's already there. If it's unengaged, it engages you now (step 2). If it's already engaged, it attacks in step 3 (if ready).",
      },
      {
        question: "What if I evaded an enemy earlier this round?",
        answer:
          "That enemy is exhausted. Exhausted enemies do not attack during the Enemy Phase. But they'll ready during Upkeep and attack next round unless dealt with.",
      },
      {
        question: "Does an enemy exhaust after attacking?",
        answer:
          "No! Unlike evaded enemies, enemies that attack normally during the Enemy Phase do NOT exhaust. They stay ready and will attack again next round. Only evading exhausts an enemy.",
      },
      {
        question: "Can enemies attack multiple investigators?",
        answer:
          "Normally, each enemy is engaged with one investigator and only attacks that one. Exception: Massive enemies engage and attack ALL investigators at their location simultaneously.",
      },
      {
        question: "What happens if an enemy has the Aloof keyword?",
        answer:
          "Aloof enemies do not auto-engage. They sit at the location passively. You must spend an Engage action to make them fight you. Until engaged, they don't attack and you can move through or past them freely.",
      },
      {
        question: "What about enemies that are not Hunter — do they move?",
        answer:
          "Non-Hunter enemies do not move on their own during the Enemy Phase. They stay at their location. They will only move if a card effect or scenario rule specifically tells them to.",
      },
      {
        question: "What if multiple investigators are at the same location as an unengaged enemy?",
        answer:
          "The lead investigator decides which investigator the enemy engages. Typically the best fighter volunteers to protect others.",
      },
    ],
    example:
      'Round 3, Enemy Phase: A Hunter Ghoul is 1 location away — it moves to your location and engages you (step 1 & 2). An Aloof Cultist is also at your location but stays unengaged (Aloof — won\'t auto-engage). The Ghoul is ready and engaged — it attacks: you take 2 damage and 1 horror (step 3). The Ghoul does NOT exhaust. Next round it will attack again unless you fight or evade it.',
  },
  {
    id: "upkeep",
    number: 4,
    name: "Upkeep Phase",
    tagline: "Reset and prepare",
    icon: "🔄",
    color: "green",
    description:
      "Upkeep is the cleanup and reset phase. All exhausted cards stand back up, you draw a card and gain a resource, and you must discard down to hand limit. Then the round ends and a new one begins with Mythos Phase.",
    steps: [
      {
        number: 1,
        title: "Ready All Exhausted Cards",
        detail:
          "Every exhausted card — your assets, your investigator card, and ALL enemies — stands back up (becomes ready). This means enemies that were evaded can attack again next round. Assets you exhausted for abilities are available again. This happens simultaneously for everyone.",
      },
      {
        number: 2,
        title: "Each Player Draws 1 Card and Gains 1 Resource",
        detail:
          "Every investigator draws 1 card from their deck into their hand, then gains 1 resource token. This is your baseline income each round — consistent but slow. Some card abilities trigger during Upkeep (check for 'During Upkeep' text).",
      },
      {
        number: 3,
        title: "Check Hand Limit",
        detail:
          "Maximum hand size is 8 cards. If you have more than 8 cards in hand after drawing, you must discard down to 8. You choose which cards to discard — this is a real strategic decision. Cards in play on the table (assets) don't count toward the limit, only cards in your hand.",
      },
      {
        number: 4,
        title: "Pay Upkeep Costs (if any)",
        detail:
          'Some asset cards have an upkeep cost printed on them (shown as a resource cost in the Upkeep window). If you cannot or choose not to pay, the card is discarded. Always check your assets for these costs.',
      },
    ],
    definitions: [
      {
        term: "Ready",
        meaning:
          "A card standing upright. Ready cards are active: assets can be used, enemies can attack.",
      },
      {
        term: "Exhaust",
        meaning:
          "Tipping a card sideways to show it's been used this round. Exhausted cards can't be used (assets) or won't attack (enemies) until readied during Upkeep.",
      },
      {
        term: "Hand Limit",
        meaning:
          "Maximum of 8 cards in your hand. Enforced during Upkeep. Cards in play on the table (assets) don't count toward this limit.",
      },
      {
        term: "Upkeep Cost",
        meaning:
          "Some asset cards require you to pay resources during Upkeep to keep them in play. Marked with a resource icon in the Upkeep section of the card. If you don't pay, the card is discarded.",
      },
    ],
    edgeCases: [
      {
        question: "Do enemies really stand back up every round?",
        answer:
          "Yes. Every exhausted enemy readies during Upkeep — including ones you evaded. If you evaded an enemy, it will be ready and able to attack again next Enemy Phase unless you defeat it or evade it again.",
      },
      {
        question: "What if my deck runs out of cards to draw?",
        answer:
          "If your deck is empty when you need to draw, you take 1 horror instead of drawing. Running out of cards is dangerous — you stop getting new tools and you keep taking horror damage every Upkeep.",
      },
      {
        question: "Do I have to discard specific cards to meet hand limit?",
        answer:
          "No — you choose which cards to discard. This is a strategic decision. Keep your most useful cards and discard the least needed ones. Sometimes it's correct to discard a good card if something better was drawn.",
      },
      {
        question: "Do cards that were used this round refresh?",
        answer:
          "Yes. All exhausted cards — assets you activated, enemies that were evaded — all stand back up during the Ready step. Every round is a full reset of exhausted state.",
      },
      {
        question: "What order does Upkeep happen in?",
        answer:
          "The exact order is: (1) Ready all exhausted cards, (2) Each player draws 1 card and gains 1 resource, (3) Check hand limit and discard if needed, (4) Pay any upkeep costs on assets.",
      },
    ],
    example:
      "Upkeep Phase: Your Flashlight asset was exhausted after use — it stands back up (ready again). The Ghoul you evaded also readies — danger returns next round. You draw 1 card (now 6 in hand) and gain 1 resource (now 4 total). Hand limit is 8, you're fine — no discard needed. Your ally asset has an upkeep cost of 1 resource — you pay it to keep her in play. New round begins — back to Mythos Phase.",
  },
];
