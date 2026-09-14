/**
 * DEMO-INHALT für den Prototyp. Die echten Argumentkarten, Personas, Needs und die
 * Karte-Need-Zuordnung kommen von SAPERED und CUPRA (Abschnitt 12 des Konzepts).
 *
 * Die Zuordnung wird hier aus Tags erzeugt, damit die Balance-Regel "volle Abdeckung"
 * (Abschnitt 8) im Demo-Content leicht prüfbar bleibt. Die Engine selbst arbeitet
 * ausschließlich mit der expliziten CardNeedMap.
 */
import type { ArgumentCardDef, ContentPack, PersonaDef, RoundDef } from "@/engine/types";

type Tag =
  | "design"
  | "performance"
  | "electric"
  | "range"
  | "value"
  | "family"
  | "tech"
  | "service"
  | "community"
  | "sustainability"
  | "experience"
  | "heritage";

interface TaggedCard extends ArgumentCardDef {
  tags: Tag[];
}

interface TaggedPersona extends Omit<PersonaDef, "needs"> {
  needs: Array<{ id: string; text: string; tags: Tag[] }>;
}

const CARDS: TaggedCard[] = [
  { id: "c01", title: "Design-led brand", text: "CUPRA is a design-first brand: expressive lines, copper accents and a look that stands out without shouting.", tags: ["design", "experience"] },
  { id: "c02", title: "Electrified performance", text: "Every CUPRA feels alive: e-HYBRID and full-electric powertrains combine instant torque with everyday efficiency.", tags: ["performance", "electric"] },
  { id: "c03", title: "Tavascan: fully electric", text: "The Tavascan delivers up to 550 km of range and 135 kW fast charging, 10 to 80 percent in under 30 minutes.", tags: ["electric", "range"] },
  { id: "c04", title: "CUPRA Garage experience", text: "CUPRA City Garages and Garage Lounges turn the dealership into a brand space with events, coffee and expert advice.", tags: ["experience", "community"] },
  { id: "c05", title: "CUPRA Tribe", text: "Owners join the CUPRA Tribe: track days, meet-ups and a community that shares the same mindset.", tags: ["community", "experience"] },
  { id: "c06", title: "Smart value", text: "Premium feel, honest pricing: strong standard equipment and attractive leasing and business rates.", tags: ["value"] },
  { id: "c07", title: "Terramar for the family", text: "The Terramar offers 5 seats, up to 642 litres of boot space and 5-star Euro NCAP safety, ready for family life.", tags: ["family"] },
  { id: "c08", title: "Connected cockpit", text: "12.9 inch infotainment, wireless CarPlay and Android Auto, over-the-air updates and a digital key on your phone.", tags: ["tech"] },
  { id: "c09", title: "Worry-free ownership", text: "Up to 5 years warranty, service packages and an 8-year battery guarantee keep total cost predictable.", tags: ["service", "value"] },
  { id: "c10", title: "Conscious materials", text: "Seats made from recycled SEAQUAL yarn, bio-based dashboards and CO2-neutral delivery for electric models.", tags: ["sustainability", "design"] },
  { id: "c11", title: "Motorsport DNA", text: "Born in racing: TCR titles, Extreme E and the fully electric CUPRA e-Racer feed straight into every road car.", tags: ["heritage", "performance"] },
  { id: "c12", title: "Charging made simple", text: "One app, one card, 600,000 charge points across Europe, plus a home wallbox package with installation.", tags: ["range", "service", "electric"] },
];

const PERSONAS: TaggedPersona[] = [
  {
    id: "p-sofia",
    name: "Sofia",
    role: "Urban professional, 34, first premium car",
    difficulty: "easy",
    intro: "I have been driving a small hatchback for years. Now I want something that feels special, but I do not want to overspend.",
    needs: [
      { id: "n-sofia-1", text: "I want a car that looks different from what everyone else drives.", tags: ["design"] },
      { id: "n-sofia-2", text: "My budget is limited. What do I actually get for my money?", tags: ["value"] },
      { id: "n-sofia-3", text: "I live in the city. Is going electric realistic for me?", tags: ["electric", "range"] },
    ],
    reactions: {
      hit: ["Okay, that is exactly what I was hoping to hear.", "Nice, I did not expect that from a brand I barely knew."],
      miss: ["Hm, that is not really what I asked about.", "Interesting, but it does not solve my question."],
    },
    convinced: "You got me. Where do I sign?",
    notConvinced: "I think I need to look at a few more brands first.",
  },
  {
    id: "p-henrik",
    name: "Henrik",
    role: "Fleet manager, 52, 120 company cars",
    difficulty: "hard",
    intro: "I decide by spreadsheet. Emotions do not pay my budget. Convince me on numbers and reliability.",
    needs: [
      { id: "n-henrik-1", text: "Total cost of ownership is everything. How predictable are your running costs?", tags: ["service", "value"] },
      { id: "n-henrik-2", text: "My drivers cover long distances. Charging downtime is a real cost for me.", tags: ["range"] },
      { id: "n-henrik-3", text: "Our board has a sustainability target. Can you back that up with facts?", tags: ["sustainability"] },
    ],
    reactions: {
      hit: ["That is a number I can put in my report.", "Good. That addresses a real risk on my list."],
      miss: ["I do not see how that helps my fleet.", "Marketing. Give me something I can calculate."],
    },
    convinced: "Send me a fleet proposal for 20 units to start.",
    notConvinced: "Not enough. We stay with our current supplier for now.",
  },
  {
    id: "p-marco",
    name: "Marco",
    role: "Young family, 41, replacing an old SUV",
    difficulty: "easy",
    intro: "Two kids, one dog and a lot of luggage. The car needs to work for us every single day.",
    needs: [
      { id: "n-marco-1", text: "Space and safety come first. Will everyone and everything fit?", tags: ["family"] },
      { id: "n-marco-2", text: "I do not want to lose money on repairs when the kids are teenagers.", tags: ["service"] },
      { id: "n-marco-3", text: "Honestly, I still want to enjoy driving once the kids are asleep.", tags: ["performance"] },
    ],
    reactions: {
      hit: ["That makes family life easier. I like it.", "Perfect, my partner will love that argument."],
      miss: ["Sounds nice, but that is not my daily problem.", "I am not sure the kids care about that."],
    },
    convinced: "Let us book a test drive for the weekend, with the whole family.",
    notConvinced: "We will keep looking. Practicality wins for us.",
  },
  {
    id: "p-aiko",
    name: "Aiko",
    role: "Tech early adopter, 29, skeptical of legacy brands",
    difficulty: "hard",
    intro: "I compare cars like gadgets. If the software is old, the car is old. Surprise me.",
    needs: [
      { id: "n-aiko-1", text: "How smart is the car really? Updates, apps, integration?", tags: ["tech"] },
      { id: "n-aiko-2", text: "Charging is the make or break. How seamless is your ecosystem?", tags: ["range", "electric"] },
      { id: "n-aiko-3", text: "Every brand claims to be sustainable. Prove it with the actual product.", tags: ["sustainability"] },
    ],
    reactions: {
      hit: ["Okay, that is genuinely a modern answer.", "Not bad. That is on the level of the newcomers."],
      miss: ["That is legacy-brand talk.", "You are not answering the actual question."],
    },
    convinced: "Alright, you are on my shortlist. Send me the configurator link.",
    notConvinced: "I will probably go with a pure EV startup.",
  },
  {
    id: "p-lena",
    name: "Lena",
    role: "Design and lifestyle enthusiast, 26",
    difficulty: "easy",
    intro: "A car is part of my style. I want to feel something when I look at it and when I talk about it.",
    needs: [
      { id: "n-lena-1", text: "Tell me about the design language. What makes it recognisable?", tags: ["design"] },
      { id: "n-lena-2", text: "I care about how things are made. What about materials?", tags: ["sustainability", "design"] },
      { id: "n-lena-3", text: "Buying a car should feel like an experience, not a transaction.", tags: ["experience"] },
    ],
    reactions: {
      hit: ["Yes, that is exactly the vibe I am looking for.", "Love that. That is a story I can tell my friends."],
      miss: ["That is a bit too rational for me.", "Hm, that does not really speak to me."],
    },
    convinced: "I am in. Which colour has the copper accents?",
    notConvinced: "It is nice, but it does not move me.",
  },
  {
    id: "p-raj",
    name: "Raj",
    role: "Long-distance commuter, 45, 40,000 km a year",
    difficulty: "hard",
    intro: "I spend three hours a day on the motorway. Range, comfort and reliability are non-negotiable.",
    needs: [
      { id: "n-raj-1", text: "Range anxiety is real for me. What is the honest range on the motorway?", tags: ["range"] },
      { id: "n-raj-2", text: "If something breaks I lose a working day. How do you protect me from that?", tags: ["service"] },
      { id: "n-raj-3", text: "I stopped believing in fast charging promises. Convince me.", tags: ["range", "electric"] },
    ],
    reactions: {
      hit: ["That is the kind of concrete answer I need.", "Good. That would change my daily routine for the better."],
      miss: ["Nice, but irrelevant on the motorway at six in the morning.", "That does not reduce my kilometres."],
    },
    convinced: "Fine. Let us calculate a lease with a wallbox.",
    notConvinced: "I will stay with diesel for another cycle.",
  },
  {
    id: "p-tom",
    name: "Tom",
    role: "Hot hatch fan, 38, weekend driver",
    difficulty: "easy",
    intro: "I grew up with fast hatchbacks. I want a car with character and a proper story behind it.",
    needs: [
      { id: "n-tom-1", text: "Does the brand actually have racing credibility?", tags: ["heritage"] },
      { id: "n-tom-2", text: "How does it feel to drive? Numbers are fine, emotion is better.", tags: ["performance"] },
      { id: "n-tom-3", text: "I want to meet people who drive the same thing.", tags: ["community"] },
    ],
    reactions: {
      hit: ["Now we are talking!", "That is the kind of stuff I want to hear."],
      miss: ["Yawn. Tell me something exciting.", "That is not why I buy a car."],
    },
    convinced: "Sold. When is the next track day?",
    notConvinced: "Cool brand, but I am not feeling it yet.",
  },
  {
    id: "p-isabel",
    name: "Isabel",
    role: "Premium-brand loyalist, 58, third German premium car",
    difficulty: "hard",
    intro: "I have driven German premium for 25 years. Why would I switch to a brand I have never considered?",
    needs: [
      { id: "n-isabel-1", text: "Premium is about the experience around the car. What does your brand offer?", tags: ["experience"] },
      { id: "n-isabel-2", text: "I expect a certain level of technology and refinement.", tags: ["tech", "design"] },
      { id: "n-isabel-3", text: "I am paying a lot. Convince me the value is really there.", tags: ["value"] },
    ],
    reactions: {
      hit: ["I admit, that is on par with what I am used to.", "That is a fair point. Go on."],
      miss: ["My current brand does that better.", "That does not justify a switch."],
    },
    convinced: "You surprised me. Arrange a comparison drive.",
    notConvinced: "Thank you, but I will stay where I am.",
  },
];

/** C1/Annahme: Alle Gruppen treffen in jeder Runde dasselbe Persona-Paar. */
export const ROUNDS: RoundDef[] = [
  { index: 0, easyPersonaId: "p-sofia", hardPersonaId: "p-henrik" },
  { index: 1, easyPersonaId: "p-marco", hardPersonaId: "p-aiko" },
  { index: 2, easyPersonaId: "p-lena", hardPersonaId: "p-raj" },
  { index: 3, easyPersonaId: "p-tom", hardPersonaId: "p-isabel" },
];

function buildCardNeedMap(): Array<[string, string]> {
  const pairs: Array<[string, string]> = [];
  for (const persona of PERSONAS) {
    for (const need of persona.needs) {
      for (const card of CARDS) {
        if (card.tags.some((t) => need.tags.includes(t))) pairs.push([card.id, need.id]);
      }
    }
  }
  return pairs;
}

export const CONTENT: ContentPack = {
  cards: CARDS.map(({ id, title, text }) => ({ id, title, text })),
  personas: PERSONAS.map((p) => ({ ...p, needs: p.needs.map(({ id, text }) => ({ id, text })) })),
  cardNeedMap: buildCardNeedMap(),
  scriptedReactions: {
    "n-henrik-1:c09": "Five years warranty and an eight-year battery guarantee. That is a line item I can defend.",
    "n-raj-1:c03": "550 kilometres WLTP. On the motorway I would plan with 400. That actually works for my route.",
    "n-tom-1:c11": "TCR titles and an electric race car? Okay, you have my attention.",
  },
};

export function getCard(id: string) {
  return CONTENT.cards.find((c) => c.id === id);
}

export function getPersona(id: string) {
  return CONTENT.personas.find((p) => p.id === id);
}
