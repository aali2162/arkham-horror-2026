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
          "Each player draws 1 card from the encounter deck and resolves it immediately. Encounter cards are always bad: Treachery cards impose harmful effects, Enemy cards spawn creatures you must fight, and Hazard cards create dangerous conditions. You cannot save or store encounter cards.",
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
          "A card drawn from the encounter deck during Mythos. Always bad. Types include Treachery (instant harmful effect), Enemy (creature appears), and Hazard (ongoing danger).",
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
          "ALL doom is removed from the advancing Agenda. The old Agenda is flipped or replaced with the next Agenda in the sequence. Read the new Agenda's setup instructions if any.",
      },
      {
        question: "Round 1 skips Mythos — does that mean no doom is placed?",
        answer:
          "Correct. In Round 1 only, you skip the entire Mythos Phase. No doom is placed, no encounter cards are drawn. You go straight to Investigation Phase.",
      },
    ],
    example:
      'Agenda has threshold 5. Currently 3 doom tokens on it. Mythos Phase begins: place 1 doom → now 4 doom. Is 4 ≥ 5? No. Nothing happens. Next round: place 1 doom → now 5 doom. Is 5 ≥ 5? YES! Remove all doom, flip Agenda to side B. Read the new terrible thing that happens.',
  },
  {
    id: "investigation",
    number: 2,
    name: "Investigation Phase",
    tagline: "Your turn to act",
    icon: "🔍",
    color: "blue",
    description:
      "This is YOUR phase — the one where you make decisions and take actions. Each player gets exactly 3 actions per round. You can use them in any order, repeat the same action, or use fewer than 3 (skipping the rest). There are 10 possible actions to choose from.",
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
          "On your turn, you have 3 action points. Each action you take costs 1 point. Choose from the 10 available actions. You can repeat the same action multiple times (e.g., Move three times).",
      },
      {
        number: 3,
        title: "Resolve Fast Cards",
        detail:
          'Cards marked "Fast" can be played at any time, even during other players\' turns, without spending an action. They\'re like free bonus plays.',
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
          "A keyword on some cards meaning they don't cost an action to play. You can play them anytime, even during other players' turns.",
      },
      {
        term: "Lead Investigator",
        meaning:
          "The first player each round. Goes first during Investigation Phase. Chosen at start of scenario.",
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
        question: "Can I react to what other players do on their turns?",
        answer:
          'Only with Fast cards or specific reaction abilities. Otherwise, you wait until your own turn to act.',
      },
    ],
    example:
      "It's your turn. You have 3 actions. Action 1: Move from Hallway to Library. Action 2: Investigate the Library (test Intellect vs Shroud). Action 3: Investigate again to grab another clue. Turn over — next player goes.",
  },
  {
    id: "enemy",
    number: 3,
    name: "Enemy Phase",
    tagline: "They strike back",
    icon: "👹",
    color: "red",
    description:
      "The Enemy Phase is automatic — enemies act on their own. First, Hunter enemies move toward the nearest investigator. Then, every engaged and ready enemy attacks the investigator at their location. You don't make choices here; you just take the hits.",
    steps: [
      {
        number: 1,
        title: "Hunter Enemies Move",
        detail:
          'Enemies with the "Hunter" keyword move 1 location toward the nearest investigator. They\'re actively pursuing you across the map. If a Hunter reaches your location, it engages you and will attack.',
      },
      {
        number: 2,
        title: "Engaged Enemies Attack",
        detail:
          "Each enemy that is both engaged with an investigator AND ready (not exhausted) attacks once. The investigator takes damage and/or horror as shown on the enemy card. After attacking, the enemy exhausts (tips sideways).",
      },
    ],
    definitions: [
      {
        term: "Hunter",
        meaning:
          "A keyword on some enemies. Hunter enemies move 1 location toward the nearest investigator at the start of the Enemy Phase. They're pursuing you.",
      },
      {
        term: "Engaged",
        meaning:
          "An enemy is engaged with you when it's at your location and fighting you. Engaged enemies attack you during the Enemy Phase.",
      },
      {
        term: "Ready",
        meaning:
          "A card that is upright and active. Ready enemies can attack. Ready assets can be used.",
      },
      {
        term: "Exhausted",
        meaning:
          "A card that is tipped sideways. Exhausted enemies don't attack. Exhausted assets can't be used. Cards ready during Upkeep.",
      },
    ],
    edgeCases: [
      {
        question: "What if a Hunter is already at my location?",
        answer:
          "It doesn't move — it's already engaged with you. It will attack in Step 2.",
      },
      {
        question: "What if I evaded an enemy earlier this round?",
        answer:
          "That enemy is exhausted. Exhausted enemies don't attack during the Enemy Phase. But they'll ready during Upkeep and attack next round unless dealt with.",
      },
      {
        question: "Can enemies attack multiple investigators?",
        answer:
          "Each enemy attacks the investigator it's engaged with. If multiple investigators are at the same location, the enemy only engages one (usually the one who drew it or engaged it).",
      },
    ],
    example:
      'A Ghoul with "Hunter" is 2 locations away from you. Enemy Phase: the Ghoul moves 1 location closer. Next round\'s Enemy Phase: it moves again, arriving at your location and engaging you. The following Enemy Phase: it attacks — you take 2 damage and 1 horror (as printed on the card). The Ghoul exhausts after attacking.',
  },
  {
    id: "upkeep",
    number: 4,
    name: "Upkeep Phase",
    tagline: "Reset and prepare",
    icon: "🔄",
    color: "green",
    description:
      "Upkeep is the cleanup phase. All exhausted cards (yours and enemies') stand back up, you draw a card and gain a resource, and you must discard down to hand limit. Then the round ends and a new one begins.",
    steps: [
      {
        number: 1,
        title: "Ready All Exhausted Cards",
        detail:
          "Every exhausted card — your assets, your investigators, and all enemies — stands back up (becomes ready). This means enemies that attacked last round can attack again. Assets you used are available again.",
      },
      {
        number: 2,
        title: "Each Player Draws 1 Card and Gains 1 Resource",
        detail:
          "Every investigator draws 1 card from their deck into their hand, and gains 1 resource token. This is your baseline income each round.",
      },
      {
        number: 3,
        title: "Check Hand Limit",
        detail:
          "Maximum hand size is 8 cards. If you have more than 8 cards in hand, you must discard down to 8. You choose which cards to discard. Cards in play (on the table) don't count — only cards in your hand.",
      },
    ],
    definitions: [
      {
        term: "Ready",
        meaning:
          "A card standing upright. Ready cards are active and can be used (assets) or will act (enemies).",
      },
      {
        term: "Exhaust",
        meaning:
          "Tipping a card sideways to show it's been used this round. Exhausted cards can't be used again until they ready during Upkeep.",
      },
      {
        term: "Hand Limit",
        meaning:
          "Maximum of 8 cards in your hand. Enforced during Upkeep. Cards in play on the table don't count toward this limit.",
      },
    ],
    edgeCases: [
      {
        question: "Do enemies really stand back up every round?",
        answer:
          "Yes. Every exhausted enemy readies during Upkeep. If you evaded an enemy, it will be ready again next round and will attack unless you evade or defeat it.",
      },
      {
        question: "What if my deck runs out of cards to draw?",
        answer:
          "If your deck is empty when you need to draw, you take 1 horror instead. Running out of cards is dangerous.",
      },
      {
        question: "Do I have to discard specific cards to meet hand limit?",
        answer:
          "No — you choose which cards to discard. This is a strategic decision. Keep your most useful cards.",
      },
    ],
    example:
      "Upkeep Phase: Your Flashlight asset was exhausted from use — it stands back up (ready). The Ghoul you evaded also readies — it can attack next round. You draw 1 card (now 6 in hand) and gain 1 resource (now 4 total). Hand limit is 8, you have 6, so no discard needed. New round begins — back to Mythos Phase.",
  },
];
