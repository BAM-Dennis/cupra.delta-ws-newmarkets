import { t } from "@/i18n/en";
import type { GroupLeaderboardEntry, IndividualLeaderboardEntry } from "@/lib/leaderboard";
import { Overline } from "./ui";

function Row({ rank, label, sub, value, highlighted }: { rank: number; label: string; sub?: string; value: string; highlighted: boolean }) {
  const tone = highlighted ? "border border-teal bg-teal-tint shadow-glow" : "border border-white/5 bg-white/5 backdrop-blur-[10px]";
  return (
    <li className={`flex min-h-11 items-center gap-[10px] rounded-[6px] px-[17px] py-[10px] ${tone}`}>
      <span className="flex size-6 shrink-0 items-center justify-center text-[16px] font-medium leading-none tabular-nums">{rank}</span>
      <span className="min-w-0 flex-1 truncate text-[16px] leading-none">
        {label}
        {sub && <span className="ml-2 text-[12px] text-white/50">{sub}</span>}
      </span>
      <span className="px-[6px] text-[16px] font-medium leading-none tabular-nums">{value}</span>
    </li>
  );
}

/** F1/F2 – Gruppen- und Einzel-Leaderboard im Zeilenstil der Streak Challenge. */
export function Leaderboards({
  groups, individuals, highlightGroupId, highlightUserId, columns = false,
}: {
  groups: GroupLeaderboardEntry[];
  individuals: IndividualLeaderboardEntry[];
  highlightGroupId?: string | null;
  highlightUserId?: string | null;
  columns?: boolean;
}) {
  return (
    <div className={`flex gap-6 ${columns ? "flex-col md:flex-row" : "flex-col"}`}>
      <section className="flex flex-1 flex-col gap-2">
        <Overline className="text-white/50">{t.teamLeaderboard}</Overline>
        <ol className="flex flex-col gap-1">
          {groups.map((g) => (
            <Row
              key={g.groupId}
              rank={g.rank}
              label={g.name}
              sub={`${g.convincedCount} ${t.personasConvinced.toLowerCase()}`}
              value={String(g.score)}
              highlighted={g.groupId === highlightGroupId}
            />
          ))}
        </ol>
      </section>
      <section className="flex flex-1 flex-col gap-2">
        <Overline className="text-white/50">{t.individualLeaderboard}</Overline>
        <ol className="flex flex-col gap-1">
          {individuals.map((p) => (
            <Row key={p.userId} rank={p.rank} label={p.nickname} sub={p.groupName} value={String(p.points)} highlighted={p.userId === highlightUserId} />
          ))}
        </ol>
      </section>
    </div>
  );
}
