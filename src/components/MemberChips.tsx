import type { Member } from "@/engine/types";
import { t } from "@/i18n/en";

/** Mitglieder der Gruppe mit Präsenzpunkt; optional mit Häkchen für erfolgte Bestätigungen. */
export function MemberChips({
  members, meId, confirmedIds,
}: {
  members: Array<Member & { active: boolean }>;
  meId: string;
  confirmedIds?: string[];
}) {
  return (
    <ul className="flex flex-wrap gap-[6px]">
      {members.map((m) => {
        const confirmed = confirmedIds?.includes(m.userId);
        return (
          <li
            key={m.userId}
            className={`flex items-center gap-[6px] rounded-full border px-[10px] py-[5px] text-[12px] leading-none ${
              confirmed ? "border-teal/60 bg-teal-tint" : "border-white/10 bg-white/5"
            } ${m.active ? "" : "opacity-40"}`}
          >
            <span className={`size-[6px] rounded-full ${m.active ? "bg-correct" : "bg-white/40"}`} />
            <span className="max-w-[120px] truncate">{m.nickname}</span>
            {m.userId === meId && <span className="text-white/50">({t.you})</span>}
            {confirmedIds && <span className={confirmed ? "text-teal" : "text-white/30"}>{confirmed ? "✓" : "○"}</span>}
          </li>
        );
      })}
    </ul>
  );
}
