/**
 * Reiner Reducer für den geteilten Gruppenzustand. Keine React-, keine DB-Abhängigkeit.
 * Der Server ist die einzige Instanz, die diesen Reducer ausführt (server-authoritative).
 */
import { GAME_CONFIG } from "./config";
import { shuffle } from "./rng";
import type {
  Action,
  ContentPack,
  Context,
  GroupState,
  Hand,
  HitStrength,
  Member,
  Move,
  PersonaDef,
  PersonaOutcome,
  Phase,
  Proposal,
} from "./types";

export class GameError extends Error {
  constructor(
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

export function initialState(): GroupState {
  return {
    phase: { name: "lobby" },
    hands: [],
    moves: [],
    outcomes: [],
    score: 0,
    convincedCount: 0,
    memberPoints: {},
  };
}

/* ---------- Abfragen (auch vom Client genutzt) ---------- */

export function openHands(state: GroupState): Hand[] {
  return state.hands.filter((h) => h.state === "open");
}

export function handsOf(state: GroupState, userId: string): Hand[] {
  return state.hands.filter((h) => h.holderId === userId);
}

export function personaById(content: ContentPack, id: string): PersonaDef {
  const p = content.personas.find((x) => x.id === id);
  if (!p) throw new GameError("UNKNOWN_PERSONA", `Persona ${id} nicht im Inhaltspaket`);
  return p;
}

/** Deterministischer Lookup in der CardNeedMap (D4, Abschnitt 7), liefert die Treffer-Stärke. */
export function matchStrength(content: ContentPack, cardId: string, needId: string): HitStrength {
  return content.cardNeedMap.find((e) => e.cardId === cardId && e.needId === needId)?.strength ?? "none";
}

export function cardMatchesNeed(content: ContentPack, cardId: string, needId: string): boolean {
  return matchStrength(content, cardId, needId) !== "none";
}

/** Konsens erreicht, wenn jedes anwesende Mitglied bestätigt hat (D2). */
export function isProposalComplete(proposal: Proposal, members: Member[]): boolean {
  return members.every((m) => proposal.confirmedBy.includes(m.userId));
}

export function currentProposal(phase: Phase): Proposal | null {
  if (phase.name === "persona_choice" || phase.name === "dialog") return phase.proposal;
  return null;
}

/* ---------- Reducer ---------- */

export function reduce(state: GroupState, action: Action, ctx: Context): GroupState {
  switch (action.type) {
    case "DEAL":
      return deal(state, ctx);
    case "CONFIRM_CARDS":
      return confirmCards(state, action.userId, ctx);
    case "PROPOSE_PERSONA":
      return proposePersona(state, action.userId, action.personaId, ctx);
    case "PROPOSE_CARD":
      return proposeCard(state, action.userId, action.cardId, ctx);
    case "CONFIRM":
      return confirm(state, action.userId, ctx);
    case "REJECT":
    case "WITHDRAW":
      return clearProposal(state, action.userId, action.type);
    case "CONTINUE":
      return continueAfterPersona(state, ctx);
  }
}

function requireMember(ctx: Context, userId: string): Member {
  const m = ctx.members.find((x) => x.userId === userId);
  if (!m) throw new GameError("NOT_A_MEMBER", "Nutzer gehört nicht zu dieser Gruppe");
  return m;
}

/** B1/B2 – Deck fester Größe, so gleichmäßig wie möglich und verdeckt auf die Mitglieder verteilt. */
function deal(state: GroupState, ctx: Context): GroupState {
  if (state.phase.name !== "lobby") throw new GameError("ALREADY_DEALT");
  if (ctx.members.length === 0) throw new GameError("EMPTY_GROUP", "Leere Gruppen erhalten kein Deck (A4)");
  // Alle Gruppen erhalten dieselben Karten (Fairness); nur die Verteilung ist zufällig.
  const deck = ctx.content.cards.slice(0, ctx.deckSize).map((c) => c.id);
  const shuffled = shuffle(deck, ctx.rng);
  const order = shuffle(
    ctx.members.map((m) => m.userId),
    ctx.rng,
  );
  const hands: Hand[] = shuffled.map((cardId, i) => ({
    cardId,
    holderId: order[i % order.length],
    state: "open",
  }));
  const memberPoints = { ...state.memberPoints };
  for (const m of ctx.members) memberPoints[m.userId] ??= 0;
  return { ...state, hands, memberPoints, phase: { name: "cards", confirmedBy: [] } };
}

/** US-2 – Jedes Mitglied bestätigt die Sichtung; sind alle durch, beginnt die Persona-Wahl. */
function confirmCards(state: GroupState, userId: string, ctx: Context): GroupState {
  if (state.phase.name !== "cards") throw new GameError("WRONG_PHASE");
  requireMember(ctx, userId);
  const confirmedBy = state.phase.confirmedBy.includes(userId)
    ? state.phase.confirmedBy
    : [...state.phase.confirmedBy, userId];
  const allConfirmed = ctx.members.every((m) => confirmedBy.includes(m.userId));
  if (allConfirmed) {
    return { ...state, phase: { name: "persona_choice", roundIndex: 0, proposal: null } };
  }
  return { ...state, phase: { name: "cards", confirmedBy } };
}

function proposePersona(state: GroupState, userId: string, personaId: string, ctx: Context): GroupState {
  if (state.phase.name !== "persona_choice") throw new GameError("WRONG_PHASE");
  requireMember(ctx, userId);
  if (state.phase.proposal) throw new GameError("PROPOSAL_PENDING", "Es liegt bereits ein Vorschlag vor");
  const round = ctx.rounds[state.phase.roundIndex];
  if (!round) throw new GameError("NO_ROUND");
  if (personaId !== round.easyPersonaId && personaId !== round.hardPersonaId) {
    throw new GameError("PERSONA_NOT_OFFERED");
  }
  const proposal: Proposal = { kind: "persona", value: personaId, proposerId: userId, confirmedBy: [userId], createdAt: ctx.now };
  return resolveIfComplete({ ...state, phase: { ...state.phase, proposal } }, ctx);
}

function proposeCard(state: GroupState, userId: string, cardId: string, ctx: Context): GroupState {
  if (state.phase.name !== "dialog") throw new GameError("WRONG_PHASE");
  requireMember(ctx, userId);
  if (state.phase.proposal) throw new GameError("PROPOSAL_PENDING", "Es liegt bereits ein Vorschlag vor");
  const hand = state.hands.find((h) => h.cardId === cardId);
  if (!hand) throw new GameError("UNKNOWN_CARD");
  if (hand.holderId !== userId) throw new GameError("NOT_YOUR_CARD", "Nur eigene Karten können vorgeschlagen werden (D2)");
  if (hand.state === "played") throw new GameError("CARD_SPENT", "Karte wurde bereits gespielt (D5)");
  const proposal: Proposal = { kind: "card", value: cardId, proposerId: userId, confirmedBy: [userId], createdAt: ctx.now };
  return resolveIfComplete({ ...state, phase: { ...state.phase, proposal } }, ctx);
}

function confirm(state: GroupState, userId: string, ctx: Context): GroupState {
  const proposal = currentProposal(state.phase);
  if (!proposal) throw new GameError("NO_PROPOSAL");
  requireMember(ctx, userId);
  if (proposal.confirmedBy.includes(userId)) return resolveIfComplete(state, ctx);
  const next: Proposal = { ...proposal, confirmedBy: [...proposal.confirmedBy, userId] };
  return resolveIfComplete({ ...state, phase: { ...state.phase, proposal: next } as Phase }, ctx);
}

function clearProposal(state: GroupState, userId: string, type: "REJECT" | "WITHDRAW"): GroupState {
  const proposal = currentProposal(state.phase);
  if (!proposal) throw new GameError("NO_PROPOSAL");
  if (type === "WITHDRAW" && proposal.proposerId !== userId) throw new GameError("NOT_PROPOSER");
  return { ...state, phase: { ...state.phase, proposal: null } as Phase };
}

/** Prüft nach jeder Bestätigung, ob der Konsens steht, und führt den Spielzug dann aus. */
function resolveIfComplete(state: GroupState, ctx: Context): GroupState {
  const proposal = currentProposal(state.phase);
  if (!proposal || !isProposalComplete(proposal, ctx.members)) return state;
  if (state.phase.name === "persona_choice" && proposal.kind === "persona") {
    return {
      ...state,
      phase: {
        name: "dialog",
        roundIndex: state.phase.roundIndex,
        personaId: proposal.value,
        needIndex: 0,
        hits: 0,
        proposal: null,
        lastMove: null,
      },
    };
  }
  if (state.phase.name === "dialog" && proposal.kind === "card") {
    return playCard(state, proposal.value, proposal.proposerId, ctx);
  }
  throw new GameError("INVALID_PROPOSAL");
}

/** D3–D5 – Karte spielen, Reaktion ermitteln, Punkte vergeben, Karte verbrauchen. */
function playCard(state: GroupState, cardId: string, contributorId: string, ctx: Context): GroupState {
  if (state.phase.name !== "dialog") throw new GameError("WRONG_PHASE");
  const persona = personaById(ctx.content, state.phase.personaId);
  const need = persona.needs[state.phase.needIndex];
  if (!need) throw new GameError("NO_NEED");
  const strength = matchStrength(ctx.content, cardId, need.id);
  const hit = strength !== "none";
  const points = strength === "none" ? 0 : GAME_CONFIG.HIT_POINTS[strength];
  const move: Move = {
    roundIndex: state.phase.roundIndex,
    personaId: persona.id,
    needId: need.id,
    cardId,
    strength,
    hit,
    points,
    contributorId,
    reaction: reactionFor(ctx, persona, need.id, cardId, strength),
  };
  const hands = state.hands.map((h) => (h.cardId === cardId ? { ...h, state: "played" as const } : h));
  const memberPoints = { ...state.memberPoints };
  for (const m of ctx.members) memberPoints[m.userId] = (memberPoints[m.userId] ?? 0) + points;
  if (hit) memberPoints[contributorId] = (memberPoints[contributorId] ?? 0) + GAME_CONFIG.CONTRIBUTOR_BONUS;

  const hits = state.phase.hits + (hit ? 1 : 0);
  const needIndex = state.phase.needIndex + 1;
  const next: GroupState = {
    ...state,
    hands,
    memberPoints,
    moves: [...state.moves, move],
    score: state.score + points,
  };
  const deckEmpty = hands.every((h) => h.state === "played");
  if (needIndex >= persona.needs.length || deckEmpty) {
    return finishPersona(next, persona, hits, needIndex, ctx);
  }
  return {
    ...next,
    phase: { ...state.phase, needIndex, hits, proposal: null, lastMove: move },
  };
}

function reactionFor(ctx: Context, persona: PersonaDef, needId: string, cardId: string, strength: HitStrength): string {
  const specific = ctx.content.scriptedReactions?.[`${needId}:${cardId}`];
  if (specific) return specific;
  const pool = strength === "none" ? persona.reactions.miss : persona.reactions[strength];
  return pool[Math.floor(ctx.rng() * pool.length)] ?? "";
}

/** D6/E2 – Persona ist überzeugt oder nicht; Bonus nach Schwierigkeit an Gruppe und Mitglieder. */
function finishPersona(state: GroupState, persona: PersonaDef, hits: number, needsPlayed: number, ctx: Context): GroupState {
  if (state.phase.name !== "dialog") throw new GameError("WRONG_PHASE");
  const convinced = hits >= GAME_CONFIG.CONVINCE_HITS_REQUIRED;
  const bonusPoints = convinced ? GAME_CONFIG.CONVINCED_BONUS[persona.difficulty] : 0;
  const memberPoints = { ...state.memberPoints };
  if (bonusPoints > 0) {
    for (const m of ctx.members) memberPoints[m.userId] = (memberPoints[m.userId] ?? 0) + bonusPoints;
  }
  const outcome: PersonaOutcome = {
    roundIndex: state.phase.roundIndex,
    personaId: persona.id,
    difficulty: persona.difficulty,
    hits,
    needsPlayed,
    convinced,
    bonusPoints,
  };
  return {
    ...state,
    memberPoints,
    score: state.score + bonusPoints,
    convincedCount: state.convincedCount + (convinced ? 1 : 0),
    outcomes: [...state.outcomes, outcome],
    phase: { name: "persona_result", roundIndex: state.phase.roundIndex, outcome },
  };
}

/** E1 – Weiter zur nächsten Runde oder Spielende, wenn das Deck aufgebraucht ist. */
function continueAfterPersona(state: GroupState, ctx: Context): GroupState {
  if (state.phase.name !== "persona_result") throw new GameError("WRONG_PHASE");
  const nextRound = state.phase.roundIndex + 1;
  const deckEmpty = openHands(state).length === 0;
  if (deckEmpty || nextRound >= ctx.rounds.length) {
    return { ...state, phase: { name: "finished" } };
  }
  return { ...state, phase: { name: "persona_choice", roundIndex: nextRound, proposal: null } };
}
