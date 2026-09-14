import type { Action, GroupState, Member, RoundDef } from "@/engine/types";
import type { GroupLeaderboardEntry, IndividualLeaderboardEntry } from "./leaderboard";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message?: string,
  ) {
    super(message ?? code);
  }
}

/** Lesbare Kurzform für die Anzeige, z. B. "500 INTERNAL: relation … does not exist". */
export function describeError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const detail = err.message && err.message !== err.code ? `: ${err.message}` : "";
    return err.status === 0 ? fallback : `${err.status} ${err.code}${detail}`;
  }
  return fallback;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    let code = "UNKNOWN";
    let message: string | undefined;
    try {
      const body = await res.json();
      code = body.error ?? code;
      message = body.message;
    } catch {
      /* kein JSON */
    }
    throw new ApiError(res.status, code, message);
  }
  return (await res.json()) as T;
}

/* ---------- Teilnehmer ---------- */

export interface GroupSnapshot {
  group: { id: string; name: string; code: string; sessionId: string };
  session: { status: "lobby" | "running"; rounds: RoundDef[]; deckSize: number };
  members: Array<Member & { active: boolean }>;
  version: number;
  state: GroupState;
  /** Der anfragende Nutzer ist Mitglied dieser Gruppe */
  isMember: boolean;
}

export type GroupPoll = { changed: false; version: number; members: GroupSnapshot["members"] } | ({ changed: true } & GroupSnapshot);

export function fetchGroup(code: string, userId: string, since?: number) {
  const params = new URLSearchParams({ userId });
  if (since !== undefined) params.set("since", String(since));
  return request<GroupPoll>(`/api/groups/${encodeURIComponent(code)}?${params}`);
}

export function joinGroup(code: string, userId: string, nickname: string) {
  return request<GroupSnapshot>(`/api/groups/${encodeURIComponent(code)}/join`, {
    method: "POST",
    body: JSON.stringify({ userId, nickname }),
  });
}

export function sendAction(code: string, action: Action) {
  return request<GroupSnapshot>(`/api/groups/${encodeURIComponent(code)}/actions`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

/* ---------- Trainer ---------- */

export interface CreateSessionResponse {
  sessionId: string;
  trainerToken: string;
}

export function createSession(groupCount: number) {
  return request<CreateSessionResponse>("/api/sessions", {
    method: "POST",
    body: JSON.stringify({ groupCount }),
  });
}

export interface GroupOverview {
  id: string;
  idx: number;
  name: string;
  code: string;
  members: Array<Member & { active: boolean }>;
  phase: GroupState["phase"]["name"];
  roundIndex: number | null;
  personaId: string | null;
  score: number;
  convincedCount: number;
  cardsLeft: number;
  cardsTotal: number;
  pendingProposal: boolean;
}

export interface SessionOverview {
  session: { id: string; status: "lobby" | "running"; groupCount: number; rounds: RoundDef[]; deckSize: number };
  groups: GroupOverview[];
  leaderboards: { groups: GroupLeaderboardEntry[]; individuals: IndividualLeaderboardEntry[] };
}

export function fetchSession(sessionId: string) {
  return request<SessionOverview>(`/api/sessions/${encodeURIComponent(sessionId)}`);
}

export function startSession(sessionId: string, trainerToken: string) {
  return request<SessionOverview>(`/api/sessions/${encodeURIComponent(sessionId)}/start`, {
    method: "POST",
    headers: { "x-trainer-token": trainerToken },
  });
}
