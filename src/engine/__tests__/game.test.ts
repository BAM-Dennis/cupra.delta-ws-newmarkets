import { describe, expect, it } from "vitest";
import { CONTENT, ROUNDS } from "@/data/content";
import { GAME_CONFIG } from "../config";
import { GameError, cardMatchesNeed, handsOf, hitQualifies, hitsRequired, initialState, matchStrength, openHands, reduce } from "../game";
import { seededRng } from "../rng";
import type { Action, Context, Difficulty, GroupState, HitStrength, Member, PersonaDef } from "../types";

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

/** Spielt ein komplettes Spiel; pro Need die beste offene Karte (voll vor Teil), die schlechteste oder keine passende. */
function playWholeGame(strategy: "best" | "worst", pick: "hard" | "easy" = "hard"): GroupState {
  const c = ctx();
  let s = run(dealt(c), members.map((m) => ({ type: "CONFIRM_CARDS", userId: m.userId }) as Action), c);
  let guard = 0;
  while (s.phase.name !== "finished" && guard++ < 100) {
    if (s.phase.name === "persona_choice") {
      const round = ROUNDS[s.phase.roundIndex];
      const personaId = pick === "hard" ? round.hardPersonaId : round.easyPersonaId;
      s = run(s, [{ type: "PROPOSE_PERSONA", userId: "u1", personaId }, { type: "CONFIRM", userId: "u2" }, { type: "CONFIRM", userId: "u3" }], c);
    } else if (s.phase.name === "dialog") {
      const persona = CONTENT.personas.find((p) => p.id === (s.phase as { personaId: string }).personaId)!;
      const need = persona.needs[s.phase.needIndex];
      const open = openHands(s);
      const rank = (strength: HitStrength) => (strength === "full" ? 2 : strength === "partial" ? 1 : 0);
      const sorted = [...open].sort((a, b) => rank(matchStrength(CONTENT, b.cardId, need.id)) - rank(matchStrength(CONTENT, a.cardId, need.id)));
      const choice = strategy === "best" ? sorted[0] : sorted[sorted.length - 1];
      const others = members.filter((m) => m.userId !== choice.holderId);
      s = run(s, [{ type: "PROPOSE_CARD", userId: choice.holderId, cardId: choice.cardId }, ...others.map((m) => ({ type: "CONFIRM", userId: m.userId }) as Action)], c);
    } else if (s.phase.name === "persona_result") {
      s = reduce(s, { type: "CONTINUE", userId: "u1" }, c);
    }
  }
  return s;
}

describe("Spielende und Wertung (E1–E3)", () => {
  it("endet nach der letzten Runde, auch wenn noch Karten offen sind", () => {
    const s = playWholeGame("best");
    expect(s.phase.name).toBe("finished");
    expect(s.outcomes).toHaveLength(ROUNDS.length);
    expect(s.moves).toHaveLength(ROUNDS.length * GAME_CONFIG.NEEDS_PER_PERSONA);
    expect(openHands(s)).toHaveLength(GAME_CONFIG.DECK_SIZE - ROUNDS.length * GAME_CONFIG.NEEDS_PER_PERSONA);
    expect(() => reduce(s, { type: "CONTINUE", userId: "u1" }, ctx())).toThrowError(expect.objectContaining({ code: "WRONG_PHASE" }));
  });

  it("wertet Treffer plus Bonus je überzeugter Persona nach Schwierigkeit", () => {
    const s = playWholeGame("best");
    const hitPoints = s.moves.reduce((sum, m) => sum + m.points, 0);
    const bonus = s.outcomes.reduce((sum, o) => sum + o.bonusPoints, 0);
    expect(s.score).toBe(hitPoints + bonus);
    expect(s.convincedCount).toBe(s.outcomes.filter((o) => o.convinced).length);
    for (const o of s.outcomes) {
      expect(o.bonusPoints).toBe(o.convinced ? GAME_CONFIG.CONVINCED_BONUS[o.difficulty] : 0);
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

/** Spielt für die Persona im Dialog genau die angegebenen Karten, egal wer sie hält. */
function playCards(state: GroupState, cardIds: string[]): GroupState {
  return cardIds.reduce((s, cardId) => {
    const holder = s.hands.find((h) => h.cardId === cardId)!.holderId;
    const others = members.filter((m) => m.userId !== holder);
    return run(s, [{ type: "PROPOSE_CARD", userId: holder, cardId }, ...others.map((m) => ({ type: "CONFIRM", userId: m.userId }) as Action)]);
  }, state);
}

function needs(personaId: string) {
  return CONTENT.personas.find((p) => p.id === personaId)!.needs;
}

/** Je Need eine Karte der gewünschten Stärke (oder ohne Treffer) aus dem Deck, keine Karte doppelt. */
function cardsFor(personaId: string, strengths: HitStrength[]): string[] {
  const taken: string[] = [];
  strengths.forEach((strength, i) => {
    const need = needs(personaId)[i];
    const card = CONTENT.cards.find((c) => !taken.includes(c.id) && matchStrength(CONTENT, c.id, need.id) === strength)!;
    taken.push(card.id);
  });
  return taken;
}

describe("Überzeug-Regel nach Schwierigkeit (Kundenfeedback)", () => {
  it("konfiguriert schwer = 3 volle Treffer, leicht = 2 Treffer inklusive Teiltreffer", () => {
    expect(hitsRequired("hard")).toBe(GAME_CONFIG.NEEDS_PER_PERSONA);
    expect(hitsRequired("easy")).toBe(2);
    expect(hitQualifies("hard", "full")).toBe(true);
    expect(hitQualifies("hard", "partial")).toBe(false);
    expect(hitQualifies("easy", "partial")).toBe(true);
    expect(hitQualifies("easy", "none")).toBe(false);
  });

  it("schwere Persona: drei volle Treffer überzeugen und bringen den hohen Bonus", () => {
    const s = playCards(inDialog("p-henrik"), cardsFor("p-henrik", ["full", "full", "full"]));
    expect(s.phase.name).toBe("persona_result");
    const o = s.outcomes[0];
    expect(o.hits).toBe(3);
    expect(o.qualifyingHits).toBe(3);
    expect(o.convinced).toBe(true);
    expect(o.bonusPoints).toBe(GAME_CONFIG.CONVINCED_BONUS.hard);
    expect(s.score).toBe(3 * GAME_CONFIG.HIT_POINTS.full + GAME_CONFIG.CONVINCED_BONUS.hard);
  });

  it("schwere Persona: zwei volle plus ein Teiltreffer reichen nicht, der Teiltreffer bringt aber Punkte", () => {
    const s = playCards(inDialog("p-henrik"), cardsFor("p-henrik", ["full", "partial", "full"]));
    const o = s.outcomes[0];
    expect(o.hits).toBe(3);
    expect(o.qualifyingHits).toBe(2);
    expect(o.convinced).toBe(false);
    expect(o.bonusPoints).toBe(0);
    expect(s.score).toBe(2 * GAME_CONFIG.HIT_POINTS.full + GAME_CONFIG.HIT_POINTS.partial);
  });

  it("leichte Persona: zwei Treffer von drei reichen, auch wenn einer nur ein Teiltreffer ist", () => {
    const s = playCards(inDialog("p-sofia"), cardsFor("p-sofia", ["partial", "none", "full"]));
    const o = s.outcomes[0];
    expect(o.hits).toBe(2);
    expect(o.qualifyingHits).toBe(2);
    expect(o.convinced).toBe(true);
    expect(o.bonusPoints).toBe(GAME_CONFIG.CONVINCED_BONUS.easy);
  });

  it("leichte Persona: ein Treffer von drei reicht nicht", () => {
    const s = playCards(inDialog("p-sofia"), cardsFor("p-sofia", ["full", "none", "none"]));
    const o = s.outcomes[0];
    expect(o.hits).toBe(1);
    expect(o.convinced).toBe(false);
  });
});

describe("Abgestufte Treffer (Seed-Content)", () => {
  it("bewertet voll, Teil und kein Treffer unterschiedlich", () => {
    // Seed-Beispiel: Sofias Value-Need trifft Smart value voll, Efficient by design nur Teil; Henriks Value-Need beide voll
    expect(matchStrength(CONTENT, "c01", "S1")).toBe("full");
    expect(matchStrength(CONTENT, "c02", "S1")).toBe("partial");
    expect(matchStrength(CONTENT, "c01", "H1")).toBe("full");
    expect(matchStrength(CONTENT, "c02", "H1")).toBe("full");
    expect(matchStrength(CONTENT, "c02", "S2")).toBe("none");
    expect(GAME_CONFIG.HIT_POINTS.partial).toBeLessThan(GAME_CONFIG.HIT_POINTS.full);
  });
});

describe("Seed-Content: sechs Bedürfnisfelder, zwölf Karten, vier Personas", () => {
  const personaOf = (needId: string) => CONTENT.personas.find((p) => p.needs.some((n) => n.id === needId))!;

  it("hat zwölf Karten in sechs Feldern mit je zwei Karten", () => {
    expect(CONTENT.fields).toHaveLength(6);
    expect(CONTENT.cards).toHaveLength(12);
    expect(GAME_CONFIG.DECK_SIZE).toBe(12);
    for (const f of CONTENT.fields) {
      expect(CONTENT.cards.filter((c) => c.fieldId === f.id), `Feld ${f.id}`).toHaveLength(2);
    }
  });

  it("hat vier Personas in zwei Runden mit je drei Needs, jeder Need zeigt auf ein Feld", () => {
    expect(CONTENT.personas).toHaveLength(4);
    expect(ROUNDS).toHaveLength(2);
    const fieldIds = new Set(CONTENT.fields.map((f) => f.id));
    for (const p of CONTENT.personas) {
      expect(p.needs, p.name).toHaveLength(GAME_CONFIG.NEEDS_PER_PERSONA);
      for (const n of p.needs) expect(fieldIds.has(n.fieldId), `Need ${n.id}`).toBe(true);
    }
    for (const r of ROUNDS) {
      expect(CONTENT.personas.find((p) => p.id === r.easyPersonaId)?.difficulty).toBe("easy");
      expect(CONTENT.personas.find((p) => p.id === r.hardPersonaId)?.difficulty).toBe("hard");
    }
  });

  it("jedes Feld wird von genau zwei Personas gebraucht", () => {
    for (const f of CONTENT.fields) {
      const users = CONTENT.personas.filter((p) => p.needs.some((n) => n.fieldId === f.id));
      expect(users, `Feld ${f.id}`).toHaveLength(2);
    }
  });

  it("die Zuordnung folgt den Feldern: jede Karte trifft genau die Needs ihres Feldes, also genau zwei Personas", () => {
    const needIds = new Set(CONTENT.personas.flatMap((p) => p.needs.map((n) => n.id)));
    for (const e of CONTENT.cardNeedMap) {
      expect(needIds.has(e.needId), `Need ${e.needId} unbekannt`).toBe(true);
      const card = CONTENT.cards.find((c) => c.id === e.cardId)!;
      const need = personaOf(e.needId).needs.find((n) => n.id === e.needId)!;
      expect(card.fieldId, `${e.cardId} trifft ${e.needId} außerhalb seines Feldes`).toBe(need.fieldId);
    }
    for (const card of CONTENT.cards) {
      const entries = CONTENT.cardNeedMap.filter((e) => e.cardId === card.id);
      expect(entries, `Karte ${card.id}`).toHaveLength(2);
      expect(new Set(entries.map((e) => personaOf(e.needId).id)).size, `Karte ${card.id} trifft zwei Personas`).toBe(2);
      expect(entries.some((e) => e.strength === "full"), `Karte ${card.id} hat keinen vollen Moment`).toBe(true);
    }
  });

  it("jede Persona kann für jeden Need einen Treffer landen, schwere Personas einen vollen", () => {
    for (const p of CONTENT.personas) {
      for (const n of p.needs) {
        const strengths = CONTENT.cards.map((c) => matchStrength(CONTENT, c.id, n.id));
        expect(strengths.some((s) => s !== "none"), `${p.name} ${n.id}`).toBe(true);
        if (p.difficulty === "hard") expect(strengths.some((s) => s === "full"), `${p.name} ${n.id} ohne vollen Treffer`).toBe(true);
      }
    }
  });

  it("jede Kombination von Personas über die Runden ist mit dem einen Deck überzeugbar", () => {
    const canConvince = (chosen: PersonaDef[], used: Set<string>): boolean => {
      if (chosen.length === 0) return true;
      const [p, ...rest] = chosen;
      const required = hitsRequired(p.difficulty as Difficulty);
      // alle Wege, mit `required` Needs und je einer zählenden Karte zu überzeugen
      const options = p.needs.map((n) => CONTENT.cards.filter((c) => !used.has(c.id) && hitQualifies(p.difficulty, matchStrength(CONTENT, c.id, n.id))).map((c) => c.id));
      const tryNeeds = (i: number, hitsLeft: number, taken: Set<string>): boolean => {
        if (hitsLeft === 0) return canConvince(rest, taken);
        if (i >= options.length) return false;
        if (tryNeeds(i + 1, hitsLeft, taken)) return true;
        return options[i].some((cardId) => !taken.has(cardId) && tryNeeds(i + 1, hitsLeft - 1, new Set([...taken, cardId])));
      };
      return tryNeeds(0, required, used);
    };
    const choices = ROUNDS.map((r) => [r.easyPersonaId, r.hardPersonaId]);
    const combos = choices.reduce<string[][]>((acc, ids) => acc.flatMap((c) => ids.map((id) => [...c, id])), [[]]);
    expect(combos).toHaveLength(4);
    for (const combo of combos) {
      const personas = combo.map((id) => CONTENT.personas.find((p) => p.id === id)!);
      expect(canConvince(personas, new Set()), `Kombination ${combo.join(" + ")} nicht überzeugbar`).toBe(true);
    }
  });
});
