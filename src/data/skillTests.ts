import { SkillTestData } from "@/types";

export const skillTestData: SkillTestData = {
  steps: [
    {
      number: 1,
      title: "Identify the Skill Being Tested",
      detail:
        "Look at what you're trying to do. Each test uses one of your 4 skills. Investigating uses Intellect. Fighting uses Combat. Evading uses Agility. Resisting horror uses Willpower. The test will tell you which skill to use.",
    },
    {
      number: 2,
      title: "Find the Difficulty Number",
      detail:
        "The target you need to meet or beat. For Investigate: the location's Shroud value. For Fight: the enemy's Fight value. For Evade: the enemy's Evade value. For treachery cards: the number printed on the card.",
    },
    {
      number: 3,
      title: "Commit Skill Cards (Optional)",
      detail:
        "Before drawing the chaos token, you can play cards from your hand that have matching skill icons. Each matching icon adds +1 to your test value. Wild icons count for any skill. Cards committed this way are discarded after the test, hit or miss.",
    },
    {
      number: 4,
      title: "Draw a Chaos Token",
      detail:
        "Reach into the chaos bag (or draw randomly) and pull 1 token. Number tokens (+1, 0, −1, −2, −3, −4) are modifiers added to your skill. Special tokens (Skull, Cultist, Tablet, Elder Thing) have effects defined by the current scenario. Elder Sign = special investigator ability. Autofail = you fail no matter what.",
    },
    {
      number: 5,
      title: "Compare Final Value to Difficulty",
      detail:
        "Final Skill = Your Base Skill + Committed Card Icons + Chaos Token Modifier. If Final Skill ≥ Difficulty → SUCCESS. If Final Skill < Difficulty → FAILURE. That's it.",
    },
  ],
  skills: [
    {
      name: "Willpower",
      icon: "🧠",
      usedFor: "Resisting horror, overcoming treachery cards, mental challenges. Dexter Drake leads with 5 Willpower.",
    },
    {
      name: "Intellect",
      icon: "📖",
      usedFor: "Investigating locations, finding clues, solving puzzles. Joe Diamond and Trish Scarborough each have 4 Intellect.",
    },
    {
      name: "Combat",
      icon: "⚔️",
      usedFor: "Fighting enemies, dealing damage. Daniela Reyes dominates with 5 Combat.",
    },
    {
      name: "Agility",
      icon: "💨",
      usedFor: "Evading enemies, avoiding traps, sneaking past threats. Trish Scarborough excels with 4 Agility.",
    },
  ],
  chaosTokens: [
    { name: "+1", modifier: "+1", description: "Add 1 to your skill value. The best number token." },
    { name: "0", modifier: "+0", description: "No change. Your skill stays as-is." },
    { name: "−1", modifier: "−1", description: "Subtract 1 from your skill value." },
    { name: "−2", modifier: "−2", description: "Subtract 2. Getting risky." },
    { name: "−3", modifier: "−3", description: "Subtract 3. Very harsh." },
    { name: "−4", modifier: "−4", description: "Subtract 4. Nearly impossible to overcome." },
    { name: "Skull 💀", modifier: "Varies", description: "Check the scenario reference card for the current effect. Usually negative, gets worse as the scenario progresses." },
    { name: "Cultist 🕯️", modifier: "Varies", description: "Scenario-specific effect. Often adds doom or triggers a harmful ability." },
    { name: "Tablet 📋", modifier: "Varies", description: "Scenario-specific effect. Usually targets your resources or cards." },
    { name: "Elder Thing 🐙", modifier: "Varies", description: "Scenario-specific effect. Often the harshest of the special tokens." },
    { name: "Elder Sign ✨", modifier: "Special", description: "Triggers your investigator's special Elder Sign ability. Usually very good — a bonus or auto-success." },
    { name: "Autofail ❌", modifier: "Auto", description: "You automatically fail the test, no matter how high your skill is. The worst token in the bag." },
  ],
  example: {
    title: "Complete Skill Test — Fighting a Ghoul",
    narrative:
      'A Ghoul is engaged with you. Fight value: 4. Your Combat: 3. You commit 2 skill cards with Combat icons (+2 total). Your modified skill before chaos: 3 + 2 = 5. You draw a chaos token: −2. Final skill: 5 + (−2) = 3. Compare: Is 3 ≥ 4? NO — you FAIL. No damage dealt to the Ghoul. If it has Retaliate, it attacks you.',
    breakdown: [
      "Base Combat: 3",
      "Committed cards: +2",
      "Skill before chaos: 5",
      "Chaos token: −2",
      "Final skill: 3",
      "Difficulty: 4",
      "3 < 4 → FAILURE",
    ],
  },
};
