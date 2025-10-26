// src/data/mockResults.ts
export const mockResults = [
    {
        id: "1",
        sideA: { name: "Pro AI", score: 8.5, logic: 9, evidence: 8, persuasion: 8.5 },
        sideB: { name: "Traditional", score: 7.2, logic: 7, evidence: 6.5, persuasion: 8 },
        reasoning:
            "Side A presented a comprehensive argument with balanced reasoning and strong data. Side B focused on emotional appeal but lacked counter-evidence.",
        highlights: {
            strongest: "Side A’s adaptive learning argument",
            bestRebuttal: "Side B’s human empathy point",
            insight: "AI as augmentation, not replacement",
        },
        blockchainHash: "0x7a3b...9f2c",
    },
    {
        id: "2",
        sideA: { name: "AI in Healthcare", score: 7.9, logic: 8, evidence: 7.5, persuasion: 8 },
        sideB: { name: "Human Diagnosis", score: 8.3, logic: 8.5, evidence: 8, persuasion: 8.5 },
        reasoning:
            "While AI demonstrated impressive diagnostic efficiency, Side B’s emphasis on ethical accountability and patient trust gave them an edge.",
        highlights: {
            strongest: "Side B’s ethical accountability point",
            bestRebuttal: "Side A’s precision data argument",
            insight: "Trust remains a core factor in healthcare adoption",
        },
        blockchainHash: "0x4d9a...ab7e",
    },
    {
        id: "3",
        sideA: { name: "Renewable Energy", score: 9, logic: 9, evidence: 9, persuasion: 8.5 },
        sideB: { name: "Fossil Fuels", score: 6.8, logic: 6.5, evidence: 6, persuasion: 7 },
        reasoning:
            "Side A presented strong statistical evidence for renewables, highlighting environmental and economic benefits. Side B lacked counter-evidence.",
        highlights: {
            strongest: "Side A’s cost-benefit analysis",
            bestRebuttal: "Side B’s energy reliability argument",
            insight: "Long-term sustainability favors renewables",
        },
        blockchainHash: "0x1f2c...3a4b",
    },
    {
        id: "4",
        sideA: { name: "Online Education", score: 7.5, logic: 7, evidence: 7.5, persuasion: 8 },
        sideB: { name: "Traditional Classroom", score: 8.1, logic: 8, evidence: 8, persuasion: 8 },
        reasoning:
            "Side B’s emphasis on in-person interaction and mentorship gave it an edge, while Side A showcased flexibility and accessibility.",
        highlights: {
            strongest: "Side B’s mentorship argument",
            bestRebuttal: "Side A’s flexibility point",
            insight: "Human interaction still crucial for learning",
        },
        blockchainHash: "0x5d3f...2e1c",
    },
    {
        id: "5",
        sideA: { name: "Electric Cars", score: 8.2, logic: 8, evidence: 8.5, persuasion: 8 },
        sideB: { name: "Gasoline Cars", score: 7.6, logic: 7, evidence: 7, persuasion: 8 },
        reasoning:
            "Side A’s argument on emission reduction and cost savings was compelling. Side B emphasized infrastructure challenges and range limitations.",
        highlights: {
            strongest: "Side A’s emission reduction stats",
            bestRebuttal: "Side B’s charging infrastructure point",
            insight: "Transition to electric vehicles is feasible but gradual",
        },
        blockchainHash: "0x9a8b...7c3d",
    },
    {
        id: "6",
        sideA: { name: "Space Exploration", score: 8.8, logic: 9, evidence: 8, persuasion: 8.5 },
        sideB: { name: "Earth Priorities", score: 7.4, logic: 7.5, evidence: 7, persuasion: 7 },
        reasoning:
            "Side A highlighted scientific advancement and long-term survival, while Side B focused on urgent terrestrial issues like poverty and climate.",
        highlights: {
            strongest: "Side A’s innovation potential",
            bestRebuttal: "Side B’s climate urgency",
            insight: "Balance needed between exploration and current crises",
        },
        blockchainHash: "0x2b3c...8d9e",
    },
    {
        id: "7",
        sideA: { name: "Cryptocurrency", score: 7.6, logic: 7, evidence: 7.5, persuasion: 8 },
        sideB: { name: "Traditional Banking", score: 8.4, logic: 8.5, evidence: 8, persuasion: 8 },
        reasoning:
            "Side B demonstrated trust, regulation, and stability advantages, while Side A highlighted innovation but also volatility risks.",
        highlights: {
            strongest: "Side B’s regulatory advantage",
            bestRebuttal: "Side A’s decentralized finance point",
            insight: "Stability often outweighs novelty in finance",
        },
        blockchainHash: "0x3e5f...1a2b",
    },
    {
        id: "8",
        sideA: { name: "Telemedicine", score: 8.1, logic: 8, evidence: 8, persuasion: 8 },
        sideB: { name: "In-Person Visits", score: 7.9, logic: 7.5, evidence: 8, persuasion: 8 },
        reasoning:
            "Side A emphasized accessibility and convenience. Side B argued patient trust and thorough examination benefits.",
        highlights: {
            strongest: "Side A’s accessibility argument",
            bestRebuttal: "Side B’s trust emphasis",
            insight: "Hybrid approach may be ideal",
        },
        blockchainHash: "0x6f1c...4d8e",
    },
    {
        id: "9",
        sideA: { name: "Remote Work", score: 8.5, logic: 8.5, evidence: 8, persuasion: 8 },
        sideB: { name: "Office Work", score: 7.8, logic: 7.5, evidence: 7.5, persuasion: 8 },
        reasoning:
            "Side A highlighted flexibility and productivity benefits, while Side B focused on collaboration and corporate culture.",
        highlights: {
            strongest: "Side A’s productivity stats",
            bestRebuttal: "Side B’s collaboration argument",
            insight: "Hybrid models might capture the best of both worlds",
        },
        blockchainHash: "0x7c4d...5f2a",
    },
    {
        id: "10",
        sideA: { name: "AI Art", score: 7.9, logic: 7.5, evidence: 8, persuasion: 8 },
        sideB: { name: "Human Art", score: 8.6, logic: 8, evidence: 8.5, persuasion: 9 },
        reasoning:
            "Side B’s emphasis on creativity and authenticity prevailed, while Side A focused on efficiency and novel techniques.",
        highlights: {
            strongest: "Side B’s authenticity argument",
            bestRebuttal: "Side A’s innovation point",
            insight: "AI can augment but not replace human creativity",
        },
        blockchainHash: "0x8e2f...3b1d",
    },
];

export const reasoningPool = [
    // 0-4: Side A pro
    "Side A clearly structured their argument effectively.",
    "Side A presented strong evidence supporting their position.",
    "Side A maintained logical consistency throughout.",
    "Side A's persuasiveness outweighed minor flaws in logic.",
    "Side A demonstrated superior argumentative strategy.",
  
    // 5-9: Side A pro & Side B con
    "Side A presented strong points, while Side B relied on weak assumptions.",
    "Side A effectively countered Side B's flawed evidence.",
    "Side A's argument coherence overshadowed Side B's inconsistencies.",
    "Side A demonstrated clarity and logic; Side B struggled to rebut.",
    "Side A highlighted key insights missed by Side B.",
  
    // 10-14: Side B pro
    "Side B provided compelling reasoning in favor of their stance.",
    "Side B's evidence was persuasive and well-structured.",
    "Side B maintained logical flow better than Side A.",
    "Side B's arguments were consistent and convincing.",
    "Side B demonstrated high-quality analysis and reasoning.",
  
    // 15-19: Side B pro & Side B con
    "Side B presented strong arguments, exposing Side A's weaknesses.",
    "Side B effectively highlighted flaws in Side A's reasoning.",
    "Side B's evidence was solid, while Side A lacked support.",
    "Side B maintained logical rigor, challenging Side A effectively.",
    "Side B demonstrated excellent critical analysis, contrasting Side A's missteps."
  ];
  