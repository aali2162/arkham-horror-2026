import { Investigator } from "@/types";

export const investigators: Investigator[] = [
  {
    name: "Daniela Reyes",
    class: "Guardian",
    willpower: 3,
    intellect: 2,
    combat: 5,
    agility: 2,
    health: 9,
    sanity: 5,
    ability: "After an enemy attacks an investigator at her location → Fight that enemy",
    abilityDetail:
      "When any enemy attacks someone at Daniela's location, she can immediately Fight that enemy as a reaction. This doesn't cost an action. Limit once per round. Makes her an excellent protector — enemies that attack her allies get punched back.",
    elderSign: "+2 Combat",
  },
  {
    name: "Joe Diamond",
    class: "Seeker",
    willpower: 2,
    intellect: 4,
    combat: 4,
    agility: 2,
    health: 7,
    sanity: 7,
    ability: "After a successful investigation → Draw 1 card",
    abilityDetail:
      "Every time Joe successfully investigates a location (discovers a clue), he draws 1 card from his deck for free. Limit once per round. This makes him incredibly efficient — he gathers clues AND cards at the same time.",
    elderSign: "+1 Intellect and draw 1 card",
  },
  {
    name: "Trish Scarborough",
    class: "Rogue",
    willpower: 2,
    intellect: 4,
    combat: 2,
    agility: 4,
    health: 8,
    sanity: 6,
    ability: "May take 1 additional Evade action per turn",
    abilityDetail:
      "Trish can evade twice in one turn without spending an extra action on the second evade. She's the escape artist — can slip away from multiple enemies or retry a failed evade. Pairs perfectly with her high Agility of 4.",
    elderSign: "+2 Agility",
  },
  {
    name: "Dexter Drake",
    class: "Mystic",
    willpower: 5,
    intellect: 2,
    combat: 2,
    agility: 3,
    health: 6,
    sanity: 8,
    ability: "After playing an asset → return a non-story asset to hand OR play a different asset",
    abilityDetail:
      "When Dexter plays an asset card, he can swap it with one already in play — returning the old asset to his hand. Or he can chain into playing a second, different asset. Limit once per round. This makes his board state incredibly flexible, cycling through tools as needed.",
    elderSign: "+1 Willpower for each asset you control",
  },
  {
    name: "Isabelle Barnes",
    class: "Survivor",
    willpower: 4,
    intellect: 2,
    combat: 3,
    agility: 3,
    health: 9,
    sanity: 5,
    ability: "During a skill test → commit a skill card from your discard pile (costs 1 direct horror)",
    abilityDetail:
      "Isabelle can reach into her discard pile and use a skill card she already played. This costs 1 horror (mental strain), so it's risky but powerful. She recycles cards other investigators have lost forever. Her Elder Sign ability lets her reroll chaos tokens for a second chance.",
    elderSign: "Reroll chaos tokens",
  },
];
