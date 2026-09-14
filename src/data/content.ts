/**
 * Seed-Content für Workshop 3 "New Market Segment" nach
 * SAPERED_Workshop-App_SeedContent_WS3_NewMarketSegment.md (Stand 14.09.2026).
 *
 * Platzhalter-Inhalt von SAPERED, gegroundet auf öffentlicher CUPRA-Raval-Recherche,
 * final bestätigt CUPRA. Werte auf Englisch, weil sie in der App erscheinen.
 *
 * Runden 1 und 2 (Sofia/Henrik, Mika/Familie Ruiz) sowie die Karte-Need-Zuordnung mit
 * Treffer-Stärke sind 1:1 aus dem Seed übernommen. Runden 3 und 4 sind im Seed bewusst
 * offen ("mit CUPRA zu bauen"); hier stehen klar markierte PLATZHALTER entlang der zwei
 * im Seed vorgeschlagenen Persona-Typen (werteorientiert, Lifestyle/Outdoor), damit das
 * 12-Karten-Deck spielbar und voll abgedeckt bleibt. Siehe PLACEHOLDER_ROUNDS unten.
 */
import type { ArgumentCardDef, CardNeedEntry, ContentPack, PersonaDef, RoundDef } from "@/engine/types";

/* ---------- Das 12-Karten-Deck (Delta-verankert) ---------- */

const CARDS: ArgumentCardDef[] = [
  { id: "c01", title: "Design-led challenger", text: "A design-first look: expressive lines, copper accents, stands out without shouting." },
  { id: "c02", title: "Connected cockpit", text: "12.9-inch responsive infotainment, wireless CarPlay and Android Auto, over-the-air updates, phone as digital key." },
  { id: "c03", title: "Smart value", text: "Premium feel, honest pricing from around 26,000 euros, strong standard equipment, attractive leasing and business rates." },
  { id: "c04", title: "Efficient by design", text: "Around 161 Wh/km, low cost per kilometre." },
  { id: "c05", title: "Everyday range", text: "Around 310 km real range, up to about 446 km WLTP on the larger battery." },
  { id: "c06", title: "Charging made simple", text: "10 to 80 percent in around 24 minutes, a large European charging network, home wallbox package with installation." },
  { id: "c07", title: "Worry-free ownership", text: "Up to 5 years warranty, service packages and an 8-year battery guarantee keep total cost predictable." },
  { id: "c08", title: "Class-leading boot", text: "Around 441 litres, flat load floor, folding rear seats." },
  { id: "c09", title: "Real cabin space", text: "Long 2599 mm wheelbase, genuine rear-seat room, wide door openings." },
  { id: "c10", title: "Alive to drive", text: "Supportive driver-focused seat, instant electric torque, everyday agility." },
  { id: "c11", title: "Conscious materials", text: "Recycled SEAQUAL yarn seats, bio-based surfaces, lower-impact production." },
  { id: "c12", title: "Power out (V2L)", text: "Run your devices straight from the car." },
];

/* ---------- Personas Runde 1 und 2 (aus dem Seed) ---------- */

const SEED_PERSONAS: PersonaDef[] = [
  {
    id: "p-sofia",
    name: "Sofia",
    profile: "Urban professional, 34, first premium car, coming from a small hatchback",
    difficulty: "easy",
    intro: "I have been driving a small hatchback for years. Now I want something that feels special, but I do not want to overspend.",
    needs: [
      { id: "S1", label: "S1", text: "I want something that feels special, a real step up." },
      { id: "S2", label: "S2", text: "It has to stay affordable. I do not want to overspend." },
      { id: "S3", label: "S3", text: "And it has to be easy to live with day to day." },
    ],
    reactions: {
      full: ["Okay, that is exactly what I was hoping to hear.", "Nice, I did not expect that from a brand I barely knew."],
      partial: ["That helps a bit, but it is not the whole answer.", "Fair point, though it is not quite what I asked."],
      miss: ["Hm, that is not really what I asked about.", "Interesting, but it does not solve my question."],
    },
    convinced: "You got me. Where do I sign?",
    notConvinced: "I think I need to look at a few more brands first.",
  },
  {
    id: "p-henrik",
    name: "Henrik",
    profile: "Fleet manager, 52, responsible for 120 company cars, decides rationally",
    difficulty: "hard",
    intro: "I decide by spreadsheet. Emotions do not pay my budget. Convince me on numbers and reliability.",
    needs: [
      { id: "H1", label: "H1", text: "Total cost of ownership has to be predictable." },
      { id: "H2", label: "H2", text: "My drivers cover long distances. Charging downtime is a real cost." },
      { id: "H3", label: "H3", text: "I need reliability and a warranty I can count on." },
    ],
    reactions: {
      full: ["That is a number I can put in my report.", "Good. That addresses a real risk on my list."],
      partial: ["Partly useful. I would need more than that to sign off.", "That is a start, not a business case."],
      miss: ["I do not see how that helps my fleet.", "Marketing. Give me something I can calculate."],
    },
    convinced: "Send me a fleet proposal for 20 units to start.",
    notConvinced: "Not enough. We stay with our current supplier for now.",
  },
  {
    id: "p-mika",
    name: "Mika",
    profile: "22, first own car, the car is a statement",
    difficulty: "easy",
    intro: "My first car has to look like me. It should stand out, still be affordable, and be fun to drive.",
    needs: [
      { id: "M1", label: "M1", text: "It has to stand out and look sharp." },
      { id: "M2", label: "M2", text: "It has to be affordable for a first car." },
      { id: "M3", label: "M3", text: "I want fun and character, not just transport." },
    ],
    reactions: {
      full: ["Yes! That is what I mean.", "Okay, that is actually cool."],
      partial: ["Kind of, but it is not the main thing for me.", "Nice detail. Not sure it changes my mind, though."],
      miss: ["That sounds like something my parents would care about.", "Meh. Not why I want a car."],
    },
    convinced: "Alright, I am in. Which colour comes with the copper details?",
    notConvinced: "I like the vibe, but I am not feeling it yet.",
  },
  {
    id: "p-ruiz",
    name: "Familie Ruiz",
    profile: "Young family, switching to electric for the first time, cautious",
    difficulty: "hard",
    intro: "We are switching to electric for the first time. It has to fit the family kit, take us on longer trips without stress, and be safe.",
    needs: [
      { id: "F1", label: "F1", text: "We need space for the whole family kit." },
      { id: "F2", label: "F2", text: "Enough real range for longer trips, without anxiety." },
      { id: "F3", label: "F3", text: "It has to be safe and dependable." },
    ],
    reactions: {
      full: ["That takes a real worry off our list.", "Good, that is the kind of thing we need to hear."],
      partial: ["Okay, that helps a little, but we are still nervous about it.", "That is something, but not quite reassuring yet."],
      miss: ["Nice, but that is not what keeps us up at night.", "That does not answer our question about switching."],
    },
    convinced: "Let us book a test drive for the weekend, with the kids.",
    notConvinced: "We are not ready yet. Maybe next year.",
  },
];

/* ---------- Karte-Need-Zuordnung mit Treffer-Stärke (aus dem Seed) ---------- */

const SEED_MAP: CardNeedEntry[] = [
  { cardId: "c01", needId: "S1", strength: "full" },
  { cardId: "c01", needId: "M1", strength: "full" },
  { cardId: "c02", needId: "S3", strength: "full" },
  { cardId: "c02", needId: "M3", strength: "partial" },
  { cardId: "c03", needId: "S2", strength: "full" },
  { cardId: "c03", needId: "H1", strength: "full" },
  { cardId: "c03", needId: "M2", strength: "full" },
  { cardId: "c04", needId: "S2", strength: "partial" },
  { cardId: "c04", needId: "H1", strength: "full" },
  { cardId: "c05", needId: "H2", strength: "partial" },
  { cardId: "c05", needId: "F2", strength: "full" },
  { cardId: "c06", needId: "H2", strength: "full" },
  { cardId: "c06", needId: "F2", strength: "full" },
  { cardId: "c07", needId: "H3", strength: "full" },
  { cardId: "c07", needId: "H1", strength: "partial" },
  { cardId: "c07", needId: "F3", strength: "full" },
  { cardId: "c08", needId: "F1", strength: "full" },
  { cardId: "c09", needId: "F1", strength: "full" },
  { cardId: "c10", needId: "S1", strength: "partial" },
  { cardId: "c10", needId: "M3", strength: "full" },
  { cardId: "c11", needId: "S1", strength: "partial" },
  { cardId: "c11", needId: "M1", strength: "partial" },
  { cardId: "c12", needId: "M3", strength: "partial" },
];

/* ---------- PLATZHALTER Runden 3 und 4 (im Seed offen, mit CUPRA zu bauen) ---------- */
/* Typ "werteorientierte Käuferin" gibt Karte 11 ihren vollen Moment, Typ "Lifestyle/Outdoor"
   gibt Karte 12 ihren vollen Moment. Namen, Needs und Zuordnung sind Vorschläge des Developers. */

const PLACEHOLDER_PERSONAS: PersonaDef[] = [
  {
    id: "p-noor",
    name: "Noor",
    profile: "Conscious consumer, 31, buys brands that match her values (placeholder)",
    difficulty: "easy",
    placeholder: true,
    intro: "I want a car I can feel good about. How it is made matters as much as how it drives.",
    needs: [
      { id: "V1", label: "V1", text: "Show me the car is made responsibly." },
      { id: "V2", label: "V2", text: "I mostly drive in the city and want low running costs." },
      { id: "V3", label: "V3", text: "It still has to feel like something I chose, not a compromise." },
    ],
    reactions: {
      full: ["That is exactly the kind of thing I look for.", "Good. That matches what I care about."],
      partial: ["That is a step in the right direction, but not the full picture.", "Okay, but I would want to know more."],
      miss: ["That is not what I asked about.", "Hm, that does not speak to my values."],
    },
    convinced: "I am convinced. This feels like the right choice.",
    notConvinced: "I am not sure the brand really means it.",
  },
  {
    id: "p-weber",
    name: "Anna Weber",
    profile: "Sustainability lead, 47, company fleet with a CO2 target (placeholder)",
    difficulty: "hard",
    placeholder: true,
    intro: "Our board set a CO2 target. I need an electric fleet that is efficient, defensible and does not hurt our budget.",
    needs: [
      { id: "W1", label: "W1", text: "I need efficiency per kilometre I can report." },
      { id: "W2", label: "W2", text: "Materials and production must hold up to scrutiny." },
      { id: "W3", label: "W3", text: "Cost over the lease period has to be predictable." },
    ],
    reactions: {
      full: ["That goes straight into my report.", "Good. That is defensible in front of the board."],
      partial: ["Useful, but I need harder facts.", "That helps, though it does not close the point."],
      miss: ["That is not relevant to our target.", "I cannot report that."],
    },
    convinced: "Send me the fleet data pack. We will run a pilot.",
    notConvinced: "Not enough evidence for the board.",
  },
  {
    id: "p-jonas",
    name: "Jonas",
    profile: "Weekend adventurer, 36, surfboards and camping gear (placeholder)",
    difficulty: "easy",
    placeholder: true,
    intro: "Weekdays it is my commute, weekends it is my base camp.",
    needs: [
      { id: "L1", label: "L1", text: "I want to power my gear off-grid." },
      { id: "L2", label: "L2", text: "Boards, tent and two friends have to fit." },
      { id: "L3", label: "L3", text: "And it should be fun on a coastal road." },
    ],
    reactions: {
      full: ["Now we are talking!", "That is exactly my weekend."],
      partial: ["Nice, but not the thing I really need.", "Okay, that is a bonus, not the answer."],
      miss: ["That does not help me at the beach.", "Not really my problem."],
    },
    convinced: "Sold. When can I take it to the coast?",
    notConvinced: "Cool car, but I am not sure it fits my weekends.",
  },
  {
    id: "p-lea",
    name: "Lea",
    profile: "Outdoor guide, 40, runs a small business, drives clients to remote spots (placeholder)",
    difficulty: "hard",
    placeholder: true,
    intro: "My car is my office and my toolbox. It has to work far from a charger, carry gear and people, and never let me down.",
    needs: [
      { id: "O1", label: "O1", text: "Real range and fast charging far from the city." },
      { id: "O2", label: "O2", text: "Power for my equipment on site." },
      { id: "O3", label: "O3", text: "Reliability I can plan a business on." },
    ],
    reactions: {
      full: ["That works for my routes.", "Good. That is something I can plan with."],
      partial: ["That helps a bit, but out there it has to be certain.", "Partly. I need more than that."],
      miss: ["That does not help me on a mountain road.", "Not relevant for my work."],
    },
    convinced: "Alright. Let us talk about a business lease.",
    notConvinced: "Too many open questions for my business.",
  },
];

const PLACEHOLDER_MAP: CardNeedEntry[] = [
  { cardId: "c11", needId: "V1", strength: "full" },
  { cardId: "c04", needId: "V1", strength: "partial" },
  { cardId: "c04", needId: "V2", strength: "full" },
  { cardId: "c03", needId: "V2", strength: "partial" },
  { cardId: "c06", needId: "V2", strength: "partial" },
  { cardId: "c01", needId: "V3", strength: "full" },
  { cardId: "c10", needId: "V3", strength: "partial" },
  { cardId: "c04", needId: "W1", strength: "full" },
  { cardId: "c05", needId: "W1", strength: "partial" },
  { cardId: "c11", needId: "W2", strength: "full" },
  { cardId: "c07", needId: "W3", strength: "full" },
  { cardId: "c03", needId: "W3", strength: "partial" },
  { cardId: "c04", needId: "W3", strength: "partial" },
  { cardId: "c12", needId: "L1", strength: "full" },
  { cardId: "c08", needId: "L2", strength: "full" },
  { cardId: "c09", needId: "L2", strength: "full" },
  { cardId: "c10", needId: "L3", strength: "full" },
  { cardId: "c01", needId: "L3", strength: "partial" },
  { cardId: "c05", needId: "O1", strength: "full" },
  { cardId: "c06", needId: "O1", strength: "full" },
  { cardId: "c12", needId: "O2", strength: "full" },
  { cardId: "c07", needId: "O3", strength: "partial" },
  { cardId: "c04", needId: "O3", strength: "partial" },
];

/** Runden: 1 und 2 aus dem Seed, 3 und 4 Platzhalter. Alle Gruppen treffen dieselben Paare. */
export const ROUNDS: RoundDef[] = [
  { index: 0, easyPersonaId: "p-sofia", hardPersonaId: "p-henrik" },
  { index: 1, easyPersonaId: "p-mika", hardPersonaId: "p-ruiz" },
  { index: 2, easyPersonaId: "p-noor", hardPersonaId: "p-weber" },
  { index: 3, easyPersonaId: "p-jonas", hardPersonaId: "p-lea" },
];

export const CONTENT: ContentPack = {
  cards: CARDS,
  personas: [...SEED_PERSONAS, ...PLACEHOLDER_PERSONAS],
  cardNeedMap: [...SEED_MAP, ...PLACEHOLDER_MAP],
  // Spezifische geskriptete Reaktionen für die Timing-Pivots des Seeds (Beispiele, tbd)
  scriptedReactions: {
    "H1:c03": "From around 26,000 euros with business rates? That changes my cost per car. Go on.",
    "H1:c07": "Five years warranty and an eight-year battery guarantee. That is a line item I can defend.",
    "F3:c07": "An eight-year battery guarantee. Okay, that is the reassurance we were looking for.",
    "F1:c08": "441 litres and a flat floor? The buggy, the bags and the dog. That works.",
  },
};

export function getCard(id: string) {
  return CONTENT.cards.find((c) => c.id === id);
}

export function getPersona(id: string) {
  return CONTENT.personas.find((p) => p.id === id);
}
