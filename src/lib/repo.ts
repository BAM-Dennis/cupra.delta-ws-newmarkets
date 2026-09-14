/**
 * Datenzugriff für Sessions, Gruppen und Mitglieder. Rohes SQL über pg, kein ORM.
 * Alle Funktionen nehmen optional einen Client, damit sie in Transaktionen laufen können.
 */
import type { Pool, PoolClient } from "pg";
import type { GroupState, Member, RoundDef } from "@/engine/types";
import { getPool } from "./db";

type Q = Pool | PoolClient;

export interface SessionRow {
  id: string;
  trainer_token: string;
  status: "lobby" | "running";
  group_count: number;
  rounds: RoundDef[];
  config: { deckSize: number };
  created_at: string;
  started_at: string | null;
}

export interface GroupRow {
  id: string;
  session_id: string;
  idx: number;
  name: string;
  code: string;
  state: GroupState;
  version: number;
  updated_at: string;
}

export interface MemberRow {
  group_id: string;
  user_id: string;
  nickname: string;
  joined_at: string;
  last_seen_at: string;
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
}

export async function getSession(id: string, q: Q = getPool()): Promise<SessionRow | null> {
  const { rows } = await q.query<SessionRow>("select * from sessions where id = $1", [id]);
  return rows[0] ?? null;
}

export async function getGroupByCode(code: string, q: Q = getPool(), forUpdate = false): Promise<GroupRow | null> {
  const { rows } = await q.query<GroupRow>(`select * from groups where code = $1${forUpdate ? " for update" : ""}`, [code]);
  return rows[0] ?? null;
}

export async function listGroups(sessionId: string, q: Q = getPool()): Promise<GroupRow[]> {
  const { rows } = await q.query<GroupRow>("select * from groups where session_id = $1 order by idx", [sessionId]);
  return rows;
}

export async function listMembers(groupId: string, q: Q = getPool()): Promise<MemberRow[]> {
  const { rows } = await q.query<MemberRow>("select * from members where group_id = $1 order by joined_at", [groupId]);
  return rows;
}

export async function listMembersForSession(sessionId: string, q: Q = getPool()): Promise<MemberRow[]> {
  const { rows } = await q.query<MemberRow>(
    "select m.* from members m join groups g on g.id = m.group_id where g.session_id = $1 order by m.joined_at",
    [sessionId],
  );
  return rows;
}

export async function upsertMember(groupId: string, userId: string, nickname: string, q: Q = getPool()): Promise<void> {
  await q.query(
    `insert into members (group_id, user_id, nickname) values ($1, $2, $3)
     on conflict (group_id, user_id) do update set nickname = excluded.nickname, last_seen_at = now()`,
    [groupId, userId, nickname],
  );
}

export async function touchMember(groupId: string, userId: string, q: Q = getPool()): Promise<void> {
  await q.query("update members set last_seen_at = now() where group_id = $1 and user_id = $2", [groupId, userId]);
}

export async function saveGroupState(groupId: string, state: GroupState, q: Q = getPool()): Promise<number> {
  const { rows } = await q.query<{ version: number }>(
    "update groups set state = $2, version = version + 1, updated_at = now() where id = $1 returning version",
    [groupId, JSON.stringify(state)],
  );
  return rows[0].version;
}

/** Mitglieder mit Lebenszeichen innerhalb des Präsenz-Fensters; der handelnde Nutzer zählt immer. */
export function activeMembers(rows: MemberRow[], timeoutMs: number, now = Date.now(), alwaysInclude?: string): Member[] {
  return rows
    .filter((r) => now - new Date(r.last_seen_at).getTime() <= timeoutMs || r.user_id === alwaysInclude)
    .map((r) => ({ userId: r.user_id, nickname: r.nickname }));
}

export function toMember(row: MemberRow): Member {
  return { userId: row.user_id, nickname: row.nickname };
}
