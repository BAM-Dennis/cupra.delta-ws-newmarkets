/**
 * Seed-Content für Workshop 3 "New Market Segment" nach
 * SAPERED_Workshop-App_SeedContent_WS3_NewMarketSegment.md (Stand 01.10.2026).
 *
 * Platzhalter-Inhalt von SAPERED, gegroundet auf öffentlicher CUPRA-Raval-Recherche,
 * final bestätigt CUPRA. Werte auf Englisch, weil sie in der App erscheinen.
 *
 * Aufbau: sechs Bedürfnisfelder mit je zwei Karten (zwölf Karten). Vier Personas in zwei
 * Runden, jede mit drei Needs, jeder Need zeigt auf ein Feld. Jedes Feld wird von genau zwei
 * Personas gebraucht, also trifft jede Karte genau zwei Personas, keine Karte ist tot.
 * Die CardNeedMap leitet sich aus den Feldern ab: jede Karte trifft jeden Need im selben Feld,
 * die Treffer-Stärke (voll oder Teil) ist je Paar festgelegt.
 */
import type { ArgumentCardDef, CardNeedEntry, ContentPack, NeedFieldDef, PersonaDef, RoundDef } from "@/engine/types";

/* ---------- Die sechs Bedürfnisfelder ---------- */

export const NEED_FIELDS: NeedFieldDef[] = [
  { id: "f1", label: "Value and running cost" },
  { id: "f2", label: "Range and charging" },
  { id: "f3", label: "Design, identity and driving character" },
  { id: "f4", label: "Space, practicality and versatility" },
  { id: "f5", label: "Tech and connectivity" },
  { id: "f6", label: "Ownership, safety and responsibility" },
];

/* ---------- Das 12-Karten-Deck: zwei Karten je Feld (Delta-verankert) ---------- */

const CARDS: ArgumentCardDef[] = [
  { id: "c01", fieldId: "f1", title: "Smart value", text: "Honest pricing from around 26,000 euros, strong standard equipment, attractive leasing and business rates." },
  { id: "c02", fieldId: "f1", title: "Efficient by design", text: "Around 161 Wh/km, low cost per kilometre." },
  { id: "c03", fieldId: "f2", title: "Everyday range", text: "Around 310 km real range, up to about 446 km WLTP on the larger battery." },
  { id: "c04", fieldId: "f2", title: "Charging made simple", text: "10 to 80 percent in around 24 minutes, a large European charging network, home wallbox package." },
  { id: "c05", fieldId: "f3", title: "Design-led challenger", text: "Expressive lines, copper accents, stands out without shouting." },
  { id: "c06", fieldId: "f3", title: "Alive to drive", text: "Instant electric torque, driver-focused seat, everyday agility." },
  { id: "c07", fieldId: "f4", title: "Class-leading boot", text: "Around 441 litres, flat load floor, folding rear seats." },
  { id: "c08", fieldId: "f4", title: "Real cabin space", text: "Long 2599 mm wheelbase, genuine rear-seat room, wide door openings, power out for your devices." },
  { id: "c09", fieldId: "f5", title: "Connected cockpit", text: "12.9-inch responsive infotainment, wireless CarPlay and Android Auto." },
  { id: "c10", fieldId: "f5", title: "Effortless everyday", text: "Over-the-air updates, phone as digital key, clear simple menus." },
  { id: "c11", fieldId: "f6", title: "Worry-free ownership", text: "Up to 5 years warranty, 8-year battery guarantee, predictable total cost." },
  { id: "c12", fieldId: "f6", title: "Conscious materials", text: "Recycled SEAQUAL yarn, bio-based surfaces, lower-impact production." },
];

/* ---------- Die vier Personas (zwei Runden, je leicht und schwer) ---------- */

const PERSONAS: PersonaDef[] = [
  {
    id: "p-sofia",
    name: "Sofia",
    image: "/design/personas/sofia.jpg",
    profile: "Urban professional, 34, first premium car, coming from a small hatchback",
    difficulty: "easy",
    intro: "I have been driving a small hatchback for years. Now I want something that feels special, but I do not want to overspend.",
    needs: [
      { id: "S1", label: "S1", fieldId: "f1", text: "It has to be a sensible spend. I do not want to overspend." },
      { id: "S2", label: "S2", fieldId: "f3", text: "I want something that feels special, a real step up." },
      { id: "S3", label: "S3", fieldId: "f5", text: "And it has to be easy to live with day to day." },
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
    image: "/design/personas/henrik.jpg",
    profile: "Fleet manager, 52, responsible for 120 company cars, decides rationally",
    difficulty: "hard",
    intro: "I decide by spreadsheet. Emotions do not pay my budget. Convince me on numbers and reliability.",
    needs: [
      { id: "H1", label: "H1", fieldId: "f1", text: "Total cost of ownership has to be predictable." },
      { id: "H2", label: "H2", fieldId: "f2", text: "My drivers cover long distances. Charging downtime is a real cost." },
      { id: "H3", label: "H3", fieldId: "f6", text: "I need reliability and a warranty I can count on." },
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
    image: "/design/personas/mika.jpg",
    profile: "22, first own car, the car is a statement",
    difficulty: "easy",
    intro: "My first car has to look like me. It should stand out, be fun to drive, and keep up with my life.",
    needs: [
      { id: "M1", label: "M1", fieldId: "f3", text: "It has to stand out and be fun to drive." },
      { id: "M2", label: "M2", fieldId: "f4", text: "I need room for my life: mates, gear, weekends." },
      { id: "M3", label: "M3", fieldId: "f5", text: "It has to be fully connected, like my phone." },
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
    name: "The Ruiz Family",
    image: "/design/personas/ruiz-family.jpg",
    profile: "Young family, switching to electric for the first time, cautious",
    difficulty: "hard",
    intro: "We are switching to electric for the first time. It has to take us on longer trips without stress, fit the family kit, and be safe.",
    needs: [
      { id: "F1", label: "F1", fieldId: "f2", text: "Enough real range for longer trips, without anxiety." },
      { id: "F2", label: "F2", fieldId: "f4", text: "We need space for the whole family kit." },
      { id: "F3", label: "F3", fieldId: "f6", text: "It has to be safe and dependable, and a responsible choice for our kids." },
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

/* ---------- Karte-Need-Zuordnung mit Treffer-Stärke ---------- */
/* Jede Karte trifft beide Needs ihres Feldes. Innerhalb eines Feldes ist je Persona meist eine
   Karte der volle Treffer und die andere der Teiltreffer (Seed, Abschnitt Wertung). Schwere
   Personas brauchen für jeden Need einen vollen Treffer; die vollen Karten der beiden schweren
   Personas sind disjunkt, damit auch die Wahl "schwer plus schwer" aufgeht. */

const CARD_NEED_MAP: CardNeedEntry[] = [
  // Feld 1 Value und running cost: Sofia S1, Henrik H1
  { cardId: "c01", needId: "S1", strength: "full" },
  { cardId: "c02", needId: "S1", strength: "partial" },
  { cardId: "c01", needId: "H1", strength: "full" },
  { cardId: "c02", needId: "H1", strength: "full" },
  // Feld 2 Range und charging: Henrik H2, Familie Ruiz F1
  { cardId: "c03", needId: "H2", strength: "partial" },
  { cardId: "c04", needId: "H2", strength: "full" },
  { cardId: "c03", needId: "F1", strength: "full" },
  { cardId: "c04", needId: "F1", strength: "partial" },
  // Feld 3 Design, Identität, Fahrcharakter: Sofia S2, Mika M1
  { cardId: "c05", needId: "S2", strength: "full" },
  { cardId: "c06", needId: "S2", strength: "partial" },
  { cardId: "c05", needId: "M1", strength: "full" },
  { cardId: "c06", needId: "M1", strength: "full" },
  // Feld 4 Platz, Praxis, Vielseitigkeit: Mika M2, Familie Ruiz F2
  { cardId: "c07", needId: "M2", strength: "partial" },
  { cardId: "c08", needId: "M2", strength: "full" },
  { cardId: "c07", needId: "F2", strength: "full" },
  { cardId: "c08", needId: "F2", strength: "full" },
  // Feld 5 Tech und Konnektivität: Sofia S3, Mika M3
  { cardId: "c09", needId: "S3", strength: "partial" },
  { cardId: "c10", needId: "S3", strength: "full" },
  { cardId: "c09", needId: "M3", strength: "full" },
  { cardId: "c10", needId: "M3", strength: "partial" },
  // Feld 6 Eigentum, Sicherheit, Verantwortung: Henrik H3, Familie Ruiz F3
  { cardId: "c11", needId: "H3", strength: "full" },
  { cardId: "c12", needId: "H3", strength: "partial" },
  { cardId: "c11", needId: "F3", strength: "full" },
  { cardId: "c12", needId: "F3", strength: "full" },
];

/** Zwei Runden, je eine leichte und eine schwere Persona. Alle Gruppen treffen dieselben Paare. */
export const ROUNDS: RoundDef[] = [
  { index: 0, easyPersonaId: "p-sofia", hardPersonaId: "p-henrik" },
  { index: 1, easyPersonaId: "p-mika", hardPersonaId: "p-ruiz" },
];

export const CONTENT: ContentPack = {
  fields: NEED_FIELDS,
  cards: CARDS,
  personas: PERSONAS,
  cardNeedMap: CARD_NEED_MAP,
  // Spezifische geskriptete Reaktionen für einzelne Need-Karte-Paare (Beispiele, tbd)
  scriptedReactions: {
    "H1:c01": "From around 26,000 euros with business rates? That changes my cost per car. Go on.",
    "H3:c11": "Five years warranty and an eight-year battery guarantee. That is a line item I can defend.",
    "F3:c11": "An eight-year battery guarantee. Okay, that is the reassurance we were looking for.",
    "F2:c07": "441 litres and a flat floor? The buggy, the bags and the dog. That works.",
    "M1:c05": "Copper accents? Okay, that is a car people will ask me about.",
  },
};

export function getCard(id: string) {
  return CONTENT.cards.find((c) => c.id === id);
}

export function getPersona(id: string) {
  return CONTENT.personas.find((p) => p.id === id);
}
