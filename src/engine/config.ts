/**
 * Alle Tuning-Werte des Spiels an einer Stelle. Werte mit "tbd" im Konzept sind
 * hier als Prototyp-Annahmen gesetzt und fürs Feinkonzept anzupassen.
 */
export const GAME_CONFIG = {
  /** A1 – Vorgabe für die Anzahl der Gruppen */
  DEFAULT_GROUP_COUNT: 4,
  MIN_GROUP_COUNT: 1,
  MAX_GROUP_COUNT: 12,
  /** B1 – Deckgröße pro Gruppe, gleich für alle Gruppen (tbd) */
  DECK_SIZE: 12,
  /** D6 – Argumente pro Persona-Dialog = Anzahl der Needs einer Persona (tbd, 3 bis 5) */
  NEEDS_PER_PERSONA: 3,
  /**
   * Überzeug-Regel je Schwierigkeit (Kundenfeedback 01.10.2026): eine schwere Persona braucht
   * drei richtige Argumente, und nur volle Treffer zählen; einer leichten reichen zwei von drei,
   * Teiltreffer zählen mit.
   */
  CONVINCE_RULE: {
    easy: { hitsRequired: 2, minStrength: "partial" },
    hard: { hitsRequired: 3, minStrength: "full" },
  } as const satisfies Record<"easy" | "hard", { hitsRequired: number; minStrength: "full" | "partial" }>,
  /** D4 – Punkte je Treffer, abgestuft nach Stärke (Seed-Content: voll 10, Teil 5, tbd) */
  HIT_POINTS: { full: 10, partial: 5 } as const,
  /** E2 – Bonus je überzeugter Persona, nach Schwierigkeit skaliert */
  CONVINCED_BONUS: { easy: 20, hard: 50 } as const,
  /** E3 – kleiner Bonus für das Mitglied, dessen Karte getroffen hat */
  CONTRIBUTOR_BONUS: 3,
  /** Mitglieder ohne Lebenszeichen seit so vielen ms zählen nicht mehr zum Konsens */
  PRESENCE_TIMEOUT_MS: 45_000,
  /** Poll-Intervall der Teilnehmer-Devices für den geteilten Gruppenzustand */
  POLL_MS: 1_500,
  /** Poll-Intervall der Trainer-Ansicht */
  TRAINER_POLL_MS: 2_000,
  NICKNAME_MIN: 1,
  NICKNAME_MAX: 20,
} as const;

export type GameConfig = typeof GAME_CONFIG;
