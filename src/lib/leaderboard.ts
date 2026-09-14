/** F1/F2 – Gruppen- und Einzel-Leaderboard aus den Gruppenzuständen einer Session. */
import type { GroupRow, MemberRow } from "./repo";

export interface GroupLeaderboardEntry {
  rank: number;
  groupId: string;
  name: string;
  score: number;
  convincedCount: number;
  finished: boolean;
}

export interface IndividualLeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  groupName: string;
  points: number;
}

export function groupLeaderboard(groups: GroupRow[]): GroupLeaderboardEntry[] {
  return groups
    .map((g) => ({
      groupId: g.id,
      name: g.name,
      score: g.state.score,
      convincedCount: g.state.convincedCount,
      finished: g.state.phase.name === "finished",
    }))
    .sort((a, b) => b.score - a.score || b.convincedCount - a.convincedCount || a.name.localeCompare(b.name))
    .map((e, i) => ({ rank: i + 1, ...e }));
}

export function individualLeaderboard(groups: GroupRow[], members: MemberRow[], top = 50): IndividualLeaderboardEntry[] {
  const byGroup = new Map(groups.map((g) => [g.id, g]));
  return members
    .map((m) => {
      const g = byGroup.get(m.group_id);
      return {
        userId: m.user_id,
        nickname: m.nickname,
        groupName: g?.name ?? "?",
        points: g?.state.memberPoints[m.user_id] ?? 0,
      };
    })
    .sort((a, b) => b.points - a.points || a.nickname.localeCompare(b.nickname))
    .slice(0, top)
    .map((e, i) => ({ rank: i + 1, ...e }));
}
