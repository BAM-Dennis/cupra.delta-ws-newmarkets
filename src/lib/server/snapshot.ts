/** Server-seitige Zusammenstellung der Antworten für Teilnehmer- und Trainer-Ansicht. */
import { openHands } from "@/engine/game";
import { GAME_CONFIG } from "@/engine/config";
import type { GroupOverview, GroupSnapshot, SessionOverview } from "@/lib/api";
import { groupLeaderboard, individualLeaderboard } from "@/lib/leaderboard";
import {
  type GroupRow,
  type MemberRow,
  type SessionRow,
  getSession,
  listGroups,
  listMembers,
  listMembersForSession,
} from "@/lib/repo";
import type { Pool, PoolClient } from "pg";

function withPresence(rows: MemberRow[], now = Date.now()) {
  return rows.map((r) => ({
    userId: r.user_id,
    nickname: r.nickname,
    active: now - new Date(r.last_seen_at).getTime() <= GAME_CONFIG.PRESENCE_TIMEOUT_MS,
  }));
}

export async function buildGroupSnapshot(
  group: GroupRow,
  session: SessionRow,
  userId: string | null,
  q?: Pool | PoolClient,
): Promise<GroupSnapshot> {
  const members = await listMembers(group.id, q);
  return {
    group: { id: group.id, name: group.name, code: group.code, sessionId: session.id },
    session: { status: session.status, rounds: session.rounds, deckSize: session.config.deckSize },
    members: withPresence(members),
    version: group.version,
    state: group.state,
    isMember: userId !== null && members.some((m) => m.user_id === userId),
  };
}

function overviewOf(group: GroupRow, members: MemberRow[]): GroupOverview {
  const { phase } = group.state;
  const roundIndex = "roundIndex" in phase ? phase.roundIndex : null;
  const personaId = phase.name === "dialog" ? phase.personaId : phase.name === "persona_result" ? phase.outcome.personaId : null;
  const pendingProposal = (phase.name === "dialog" || phase.name === "persona_choice") && phase.proposal !== null;
  return {
    id: group.id,
    idx: group.idx,
    name: group.name,
    code: group.code,
    members: withPresence(members),
    phase: phase.name,
    roundIndex,
    personaId,
    score: group.state.score,
    convincedCount: group.state.convincedCount,
    cardsLeft: openHands(group.state).length,
    cardsTotal: group.state.hands.length,
    pendingProposal,
  };
}

export async function buildSessionOverview(sessionId: string, q?: Pool | PoolClient): Promise<SessionOverview | null> {
  const session = await getSession(sessionId, q);
  if (!session) return null;
  const [groups, members] = await Promise.all([listGroups(sessionId, q), listMembersForSession(sessionId, q)]);
  const byGroup = new Map<string, MemberRow[]>();
  for (const m of members) byGroup.set(m.group_id, [...(byGroup.get(m.group_id) ?? []), m]);
  return {
    session: {
      id: session.id,
      status: session.status,
      groupCount: session.group_count,
      rounds: session.rounds,
      deckSize: session.config.deckSize,
    },
    groups: groups.map((g) => overviewOf(g, byGroup.get(g.id) ?? [])),
    leaderboards: {
      groups: groupLeaderboard(groups),
      individuals: individualLeaderboard(groups, members),
    },
  };
}
