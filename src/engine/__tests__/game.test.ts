import { describe, expect, it } from "vitest";
import { CONTENT, ROUNDS } from "@/data/content";
import { GAME_CONFIG } from "../config";
import { GameError, cardMatchesNeed, handsOf, initialState, matchStrength, openHands, reduce } from "../game";
import { seededRng } from "../rng";
import type { Action, Context, GroupState, Member } from "../types";

const members: Member[] = [
  { userId: "u1", nickname: "Anna" },
  { userId: "u2", nickname: "Ben" },
  { userId: "u3", nickname: "Cem" },
];

function ctx(over: Partial<Context> = {}): Context {
  return { members, rounds: ROUNDS, content: CONTENT, deckSize: GAME_CONFIG.DECK_SIZE, now: 0, rng: seededRng(42), ...over };
}

function run(state: GroupState, actions: Action[], c = ctx()): GroupState {
  return actions.reduce((s, a) => reduce(s, a, c), state);
}

function dealt(c = ctx()): GroupState {
  return reduce(initialState(), { type: "DEAL" }, c);
}

/** Bringt die Gruppe bis in den Dialog mit der gewählten Persona. */
function inDialog(personaId: string, c = ctx()): GroupState {
  return run(
    dealt(c),
    [
      ...members.map((m) => ({ type: "CONFIRM_CARDS", userId: m.userId }) as Action),
      { type: "PROPOSE_PERSONA", userId: "u1", personaId },
      { type: "CONFIRM", userId: "u2" },
      { type: "CONFIRM", userId: "u3" },
    ],
    c,
  );
}

describe("Kartenverteilung (B1, B2)", () => {
  it("verteilt das Deck fester Größe so gleichmäßig wie möglich", () => {
    const s = dealt();
    expect(s.hands).toHaveLength(GAME_CONFIG.DECK_SIZE);
    const counts = members.map((m) => handsOf(s, m.userId).length);
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    expect(counts.reduce((a, b) => a + b, 0)).toBe(GAME_CONFIG.DECK_SIZE);
  });

  it("gibt allen Gruppen dieselben Karten, unabhängig von der Gruppengröße", () => {
    const a = dealt(ctx({ members: members.slice(0, 1), rng: seededRng(1) }));
    const b = dealt(ctx({ members, rng: seededRng(2) }));
    const ids = (s: GroupState) => s.hands.map((h) => h.cardId).sort();
    expect(ids(a)).toEqual(ids(b));
    expect(a.hands).toHaveLength(GAME_CONFIG.DECK_SIZE);
  });

  it("verweigert leeren Gruppen ein Deck (A4)", () => {
    expect(() => dealt(ctx({ members: [] }))).toThrow(GameError);
  });
});

describe("Sichtung und Persona-Wahl (US-2, US-3)", () => {
  it("wechselt erst zur Persona-Wahl, wenn alle bestätigt haben", () => {
    const s1 = run(dealt(), [{ type: "CONFIRM_CARDS", userId: "u1" }]);
    expect(s1.phase.name).toBe("cards");
    const s2 = run(s1, [{ type: "CONFIRM_CARDS", userId: "u2" }, { type: "CONFIRM_CARDS", userId: "u3" }]);
    expect(s2.phase).toEqual({ name: "persona_choice", roundIndex: 0, proposal: null });
  });

  it("lässt nur die beiden angebotenen Personas zu", () => {
    const s = run(dealt(), members.map((m) => ({ type: "CONFIRM_CARDS", userId: m.userId }) as Action));
    expect(() => reduce(s, { type: "PROPOSE_PERSONA", userId: "u1", personaId: "p-tom" }, ctx())).toThrowError(expect.objectContaining({ code: "PERSONA_NOT_OFFERED" }));
  });

  it("startet den Dialog erst nach Bestätigung aller anderen Mitglieder", () => {
    const s = run(dealt(), [
      ...members.map((m) => ({ type: "CONFIRM_CARDS", userId: m.userId }) as Action),
      { type: "PROPOSE_PERSONA", userId: "u1", personaId: "p-henrik" },
      { type: "CONFIRM", userId: "u2" },
    ]);
    expect(s.phase.name).toBe("persona_choice");
    const s2 = reduce(s, { type: "CONFIRM", userId: "u3" }, ctx());
    expect(s2.phase.name).toBe("dialog");
  });

  it("führt einen Vorschlag in einer Ein-Personen-Gruppe sofort aus", () => {
    const solo = ctx({ members: members.slice(0, 1) });
    const s = run(dealt(solo), [{ type: "CONFIRM_CARDS", userId: "u1" }, { type: "PROPOSE_PERSONA", userId: "u1", personaId: "p-sofia" }], solo);
    expect(s.phase.name).toBe("dialog");
  });
});

describe("Konsens-Spielzug (D2–D5)", () => {
  it("erlaubt nur eigene, offene Karten als Vorschlag", () => {
    const s = inDialog("p-sofia");
    const foreign = handsOf(s, "u2")[0].cardId;
    expect(() => reduce(s, { type: "PROPOSE_CARD", userId: "u1", cardId: foreign }, ctx())).toThrowError(expect.objectContaining({ code: "NOT_YOUR_CARD" }));
  });

  it("spielt die Karte nach Bestätigung aller, verbraucht sie und vergibt Punkte bei Treffer", () => {
    const s = inDialog("p-sofia");
    if (s.phase.name !== "dialog") throw new Error("expected dialog");
    const need = CONTENT.personas.find((p) => p.id === "p-sofia")!.needs[0];
    const own = handsOf(s, "u1");
    const card = own.find((h) => cardMatchesNeed(CONTENT, h.cardId, need.id)) ?? own[0];
    const strength = matchStrength(CONTENT, card.cardId, need.id);
    const hit = strength !== "none";

    const pending = reduce(s, { type: "PROPOSE_CARD", userId: "u1", cardId: card.cardId }, ctx());
    expect(pending.hands.find((h) => h.cardId === card.cardId)?.state).toBe("open");

    const played = run(pending, [{ type: "CONFIRM", userId: "u2" }, { type: "CONFIRM", userId: "u3" }]);
    expect(played.hands.find((h) => h.cardId === card.cardId)?.state).toBe("played");
    expect(played.moves).toHaveLength(1);
    expect(played.moves[0].hit).toBe(hit);
    expect(played.moves[0].strength).toBe(strength);
    const expected = strength === "none" ? 0 : GAME_CONFIG.HIT_POINTS[strength];
    expect(played.score).toBe(expected);
    if (hit) {
      expect(played.memberPoints.u1).toBe(expected + GAME_CONFIG.CONTRIBUTOR_BONUS);
      expect(played.memberPoints.u2).toBe(expected);
    }
    expect(() => reduce(played, { type: "PROPOSE_CARD", userId: "u1", cardId: card.cardId }, ctx())).toThrowError(expect.objectContaining({ code: "CARD_SPENT" }));
  });

  it("verwirft einen Vorschlag bei Ablehnung", () => {
    const s = inDialog("p-sofia");
    const card = handsOf(s, "u1")[0].cardId;
    const rejected = run(s, [{ type: "PROPOSE_CARD", userId: "u1", cardId: card }, { type: "REJECT", userId: "u2" }]);
    expect(rejected.phase.name === "dialog" && rejected.phase.proposal).toBeNull();
    expect(rejected.hands.find((h) => h.cardId === card)?.state).toBe("open");
  });
});

/** Spielt einen kompletten Dialog mit der ersten offenen Karte des jeweils passenden Halters. */
function playWholeGame(strategy: "best" | "worst"): GroupState {
  const c = ctx();
  let s = run(dealt(c), members.map((m) => ({ type: "CONFIRM_CARDS", userId: m.userId }) as Action), c);
  let guard = 0;
  while (s.phase.name !== "finished" && guard++ < 100) {
    if (s.phase.name === "persona_choice") {
      const round = ROUNDS[s.phase.roundIndex];
      s = run(s, [{ type: "PROPOSE_PERSONA", userId: "u1", personaId: round.hardPersonaId }, { type: "CONFIRM", userId: "u2" }, { type: "CONFIRM", userId: "u3" }], c);
    } else if (s.phase.name === "dialog") {
      const persona = CONTENT.personas.find((p) => p.id === (s.phase as { personaId: string }).personaId)!;
      const need = persona.needs[s.phase.needIndex];
      const open = openHands(s);
      const matching = open.filter((h) => cardMatchesNeed(CONTENT, h.cardId, need.id));
      const pick = strategy === "best" ? (matching[0] ?? open[0]) : (open.find((h) => !matching.includes(h)) ?? open[0]);
      const others = members.filter((m) => m.userId !== pick.holderId);
      s = run(s, [{ type: "PROPOSE_CARD", userId: pick.holderId, cardId: pick.cardId }, ...others.map((m) => ({ type: "CONFIRM", userId: m.userId }) as Action)], c);
    } else if (s.phase.name === "persona_result") {
      s = reduce(s, { type: "CONTINUE", userId: "u1" }, c);
    }
  }
  return s;
}

describe("Spielende und Wertung (E1–E3)", () => {
  it("endet, wenn alle Karten gespielt sind, und wertet überzeugte Personas nach Schwierigkeit", () => {
    const s = playWholeGame("best");
    expect(s.phase.name).toBe("finished");
    expect(openHands(s)).toHaveLength(0);
    expect(s.moves).toHaveLength(GAME_CONFIG.DECK_SIZE);
    expect(s.outcomes).toHaveLength(ROUNDS.length);
    const hitPoints = s.moves.reduce((sum, m) => sum + m.points, 0);
    const bonus = s.outcomes.reduce((sum, o) => sum + o.bonusPoints, 0);
    expect(s.score).toBe(hitPoints + bonus);
    expect(s.convincedCount).toBe(s.outcomes.filter((o) => o.convinced).length);
    for (const o of s.outcomes) {
      if (o.convinced) expect(o.bonusPoints).toBe(GAME_CONFIG.CONVINCED_BONUS[o.difficulty]);
    }
  });

  it("gibt jedem Mitglied den Gruppenerfolg plus kleinen Beitrags-Bonus", () => {
    const s = playWholeGame("best");
    for (const m of members) {
      const ownHits = s.moves.filter((mv) => mv.hit && mv.contributorId === m.userId).length;
      expect(s.memberPoints[m.userId]).toBe(s.score + ownHits * GAME_CONFIG.CONTRIBUTOR_BONUS);
    }
  });

  it("überzeugt niemanden, wenn nur unpassende Karten gespielt werden", () => {
    const s = playWholeGame("worst");
    expect(s.phase.name).toBe("finished");
    expect(s.convincedCount).toBe(0);
  });
});

describe("Abgestufte Treffer (Seed-Content)", () => {
  it("bewertet voll, Teil und kein Treffer unterschiedlich", () => {
    // Seed: Karte 4 "Efficient by design" trifft Sofias S2 nur teilweise, Henriks H1 voll
    expect(matchStrength(CONTENT, "c04", "S2")).toBe("partial");
    expect(matchStrength(CONTENT, "c04", "H1")).toBe("full");
    expect(matchStrength(CONTENT, "c04", "S1")).toBe("none");
    expect(GAME_CONFIG.HIT_POINTS.partial).toBeLessThan(GAME_CONFIG.HIT_POINTS.full);
  });

  it("Timing-Pivot: Smart value trifft Sofia, Henrik und Mika voll", () => {
    for (const need of ["S2", "H1", "M2"]) expect(matchStrength(CONTENT, "c03", need)).toBe("full");
  });
});

describe("Seed-Content: Balance-Regel volle Abdeckung (Abschnitt 8)", () => {
  it("jede Karte hat über alle Runden mindestens einen vollen Treffer", () => {
    for (const card of CONTENT.cards) {
      const full = CONTENT.cardNeedMap.some((e) => e.cardId === card.id && e.strength === "full");
      expect(full, `Karte ${card.id} hat keinen vollen Moment`).toBe(true);
    }
  });

  it("jeder Need verweist auf eine existierende Persona und jede Karte der Zuordnung existiert", () => {
    const needIds = new Set(CONTENT.personas.flatMap((p) => p.needs.map((n) => n.id)));
    const cardIds = new Set(CONTENT.cards.map((c) => c.id));
    for (const e of CONTENT.cardNeedMap) {
      expect(needIds.has(e.needId), `Need ${e.needId} unbekannt`).toBe(true);
      expect(cardIds.has(e.cardId), `Karte ${e.cardId} unbekannt`).toBe(true);
    }
    expect(needIds.size).toBe(CONTENT.personas.length * GAME_CONFIG.NEEDS_PER_PERSONA);
  });

  it("jede Karte passt auf mindestens einen Need in jeder Runde, egal welche Persona gewählt wird", () => {
    for (const card of CONTENT.cards) {
      const coverage = ROUNDS.map((r) =>
        [r.easyPersonaId, r.hardPersonaId].filter((pid) => {
          const persona = CONTENT.personas.find((p) => p.id === pid)!;
          return persona.needs.some((n) => cardMatchesNeed(CONTENT, card.id, n.id));
        }).length,
      );
      expect(coverage.some((c) => c > 0), `Karte ${card.id} ist eine tote Karte`).toBe(true);
    }
  });
});
