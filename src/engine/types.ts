/**
 * Typen der Spiel-Engine für Workshop 3 "New Market Segment".
 * Referenzen (A1, B2, D2 …) verweisen auf die funktionalen Anforderungen im Konzeptdokument.
 */

export type Difficulty = "easy" | "hard";

export interface ArgumentCardDef {
  id: string;
  title: string;
  text: string;
}

export interface NeedDef {
  id: string;
  text: string;
}

export interface PersonaDef {
  id: string;
  name: string;
  /** Kurzbeschreibung des Segments, z. B. "Fleet manager, 52" */
  role: string;
  difficulty: Difficulty;
  intro: string;
  needs: NeedDef[];
  /** Generische geskriptete Reaktionen (D3), falls kein spezifischer Text hinterlegt ist */
  reactions: { hit: string[]; miss: string[] };
  convinced: string;
  notConvinced: string;
}

/** Inhaltspaket: Karten, Personas und die Karte-Need-Zuordnung (Abschnitt 7 des Konzepts). */
export interface ContentPack {
  cards: ArgumentCardDef[];
  personas: PersonaDef[];
  /** CardNeedMap – gültige Paare, many-to-many */
  cardNeedMap: Array<[cardId: string, needId: string]>;
  /** Optionale spezifische Reaktion je Kombination "needId:cardId" */
  scriptedReactions?: Record<string, string>;
}

/** Eine Runde bietet jeder Gruppe dieselbe leichte und schwere Persona an (C1). */
export interface RoundDef {
  index: number;
  easyPersonaId: string;
  hardPersonaId: string;
}

export interface Member {
  userId: string;
  nickname: string;
}

/** Eine Karte im Deck der Gruppe mit Halter und Zustand (B2, D5). */
export interface Hand {
  cardId: string;
  holderId: string;
  state: "open" | "played";
}

/** Vorschlag eines Mitglieds, der von den anderen bestätigt werden muss (D2). */
export interface Proposal {
  kind: "persona" | "card";
  value: string;
  proposerId: string;
  confirmedBy: string[];
  createdAt: number;
}

export interface Move {
  roundIndex: number;
  personaId: string;
  needId: string;
  cardId: string;
  hit: boolean;
  points: number;
  contributorId: string;
  reaction: string;
}

export interface PersonaOutcome {
  roundIndex: number;
  personaId: string;
  difficulty: Difficulty;
  hits: number;
  needsPlayed: number;
  convinced: boolean;
  /** Bonus für die überzeugte Persona (E2), ohne die Treffer-Punkte */
  bonusPoints: number;
}

export type Phase =
  | { name: "lobby" }
  | { name: "cards"; confirmedBy: string[] }
  | { name: "persona_choice"; roundIndex: number; proposal: Proposal | null }
  | {
      name: "dialog";
      roundIndex: number;
      personaId: string;
      needIndex: number;
      hits: number;
      proposal: Proposal | null;
      lastMove: Move | null;
    }
  | { name: "persona_result"; roundIndex: number; outcome: PersonaOutcome }
  | { name: "finished" };

export interface GroupState {
  phase: Phase;
  hands: Hand[];
  moves: Move[];
  outcomes: PersonaOutcome[];
  /** Gruppenpunkte (E2) */
  score: number;
  convincedCount: number;
  /** Einzelpunkte je userId (E3) */
  memberPoints: Record<string, number>;
}

export type Action =
  | { type: "DEAL" }
  | { type: "CONFIRM_CARDS"; userId: string }
  | { type: "PROPOSE_PERSONA"; userId: string; personaId: string }
  | { type: "PROPOSE_CARD"; userId: string; cardId: string }
  | { type: "CONFIRM"; userId: string }
  | { type: "REJECT"; userId: string }
  | { type: "WITHDRAW"; userId: string }
  | { type: "CONTINUE"; userId: string };

/** Alles, was der Reducer von außen braucht: Mitglieder, Runden, Inhalt, Zeit, Zufall. */
export interface Context {
  members: Member[];
  rounds: RoundDef[];
  content: ContentPack;
  deckSize: number;
  now: number;
  rng: () => number;
}
