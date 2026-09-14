/**
 * localStorage-Zugriff für die persistente User-ID (A3), den Nickname und Trainer-Tokens.
 * Alle Zugriffe sind abgesichert, weil localStorage im Private Mode fehlen kann.
 */
const KEYS = {
  userId: "nms.userId",
  nickname: "nms.nickname",
  trainerToken: (sessionId: string) => `nms.trainer.${sessionId}`,
  lastSession: "nms.trainer.lastSession",
} as const;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* ignorieren */
  }
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface StoredUser {
  userId: string;
  nickname: string | null;
}

/** A3 – Persistente User-ID beim ersten Besuch erzeugen. */
export function loadStoredUser(): StoredUser {
  let userId = read(KEYS.userId);
  if (!userId) {
    userId = newId();
    write(KEYS.userId, userId);
  }
  return { userId, nickname: read(KEYS.nickname) };
}

export function saveNickname(nickname: string) {
  write(KEYS.nickname, nickname);
}

export function saveTrainerToken(sessionId: string, token: string) {
  write(KEYS.trainerToken(sessionId), token);
  write(KEYS.lastSession, sessionId);
}

export function loadTrainerToken(sessionId: string): string | null {
  return read(KEYS.trainerToken(sessionId));
}

export function loadLastSession(): string | null {
  return read(KEYS.lastSession);
}
