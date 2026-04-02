import { DamageData } from "@/types";

export const damageData: DamageData = {
  sections: [
    {
      id: "damage",
      title: "Physical Damage",
      icon: "❤️",
      description:
        "Damage represents physical injuries — cuts, burns, broken bones. Damage tokens accumulate on your investigator card. When your total damage reaches your printed Health, you're defeated.",
      definitions: [
        { term: "Health", meaning: "The maximum damage your investigator can take before being defeated. Printed on your investigator card. Ranges from 6 (Dexter Drake) to 9 (Daniela Reyes, Isabelle Barnes)." },
        { term: "Damage Token", meaning: "A physical marker placed on your investigator card. Each token = 1 point of damage taken." },
        { term: "Defeated", meaning: "When total damage ≥ Health, you're removed from the scenario and take 1 physical trauma." },
      ],
      example:
        "Daniela Reyes has 9 Health. She takes 3 damage from a Ghoul attack (3 tokens on her card). Later, she takes 2 more from a treachery card (5 total). A Vampire deals 4 more damage (9 total). 9 ≥ 9 — Daniela is DEFEATED. She takes 1 physical trauma and is removed from the scenario.",
      details: [
        "Damage comes from: enemy attacks, treachery cards, failed skill tests, and card abilities",
        "Damage stays between rounds — it doesn't heal automatically",
        "Some cards can heal damage (remove tokens)",
        "Damage on assets/allies protects you — they take hits instead",
        "When defeated by damage, you gain 1 physical trauma (permanent)",
      ],
    },
    {
      id: "horror",
      title: "Mental Horror",
      icon: "🧠",
      description:
        "Horror represents mental trauma — fear, madness, existential dread. It works exactly like damage but for your mind. Horror tokens accumulate on your investigator card. When your total horror reaches your printed Sanity, you're defeated.",
      definitions: [
        { term: "Sanity", meaning: "The maximum horror your investigator can take before being defeated. Printed on your investigator card. Ranges from 5 (Daniela, Isabelle) to 8 (Dexter Drake)." },
        { term: "Horror Token", meaning: "A mental marker placed on your investigator card. Each token = 1 point of horror taken." },
        { term: "Defeated (by horror)", meaning: "When total horror ≥ Sanity, you're removed from the scenario and take 1 mental trauma." },
      ],
      example:
        "Dexter Drake has 8 Sanity. He takes 2 horror from an encounter card (2 tokens). Later, he uses Isabelle's discard ability for 1 horror (3 total). A treachery deals 3 more (6 total). Another encounter card: 3 horror (9 total). 9 ≥ 8 — Dexter is DEFEATED by insanity. He takes 1 mental trauma.",
      details: [
        "Horror comes from: encounter cards, enemy abilities, failed Willpower tests, and card effects",
        "Horror doesn't heal automatically between rounds",
        "Some cards can heal horror (remove tokens)",
        "Horror on allies protects you — they absorb the mental strain",
        "When defeated by horror, you gain 1 mental trauma (permanent)",
        "Running out of cards in your deck causes 1 horror per card you can't draw",
      ],
    },
    {
      id: "trauma",
      title: "Permanent Trauma",
      icon: "💀",
      description:
        "Trauma is the permanent scar from being defeated. It carries through the entire campaign — scenario to scenario. Each trauma means you start every future scenario already weakened. Accumulate too much and your investigator is killed or driven insane permanently.",
      definitions: [
        { term: "Physical Trauma", meaning: "Gained when defeated by damage. Each physical trauma = start next scenario with 1 damage token already on you." },
        { term: "Mental Trauma", meaning: "Gained when defeated by horror. Each mental trauma = start next scenario with 1 horror token already on you." },
        { term: "Death", meaning: "If your physical trauma ever equals or exceeds your printed Health, your investigator is killed. Permanently removed from the campaign." },
        { term: "Insanity", meaning: "If your mental trauma ever equals or exceeds your printed Sanity, your investigator goes insane. Permanently removed from the campaign." },
      ],
      example:
        "Joe Diamond (Health 7, Sanity 7) was defeated in Scenario 1 (took 1 physical trauma). In Scenario 2, he starts with 1 damage already on him — effectively only 6 health. If defeated again in Scenario 2, he'd have 2 physical trauma. Still under 7, so he survives to Scenario 3 starting with 2 damage.",
      details: [
        "Trauma is permanent for the entire campaign (all 3 scenarios)",
        "Physical trauma: start each scenario with that many damage tokens",
        "Mental trauma: start each scenario with that many horror tokens",
        "If physical trauma ≥ Health → investigator DIES (removed from campaign permanently)",
        "If mental trauma ≥ Sanity → investigator goes INSANE (removed from campaign permanently)",
        "Resigning from a scenario does NOT give trauma — that's why Resign is valuable",
        "Some scenario resolutions can also give trauma as a story consequence",
      ],
    },
  ],
};
