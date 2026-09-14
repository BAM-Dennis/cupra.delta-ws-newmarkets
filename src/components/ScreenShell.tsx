import type { ReactNode } from "react";
import type { Member } from "@/engine/types";
import { Background } from "./Background";
import { MemberChips } from "./MemberChips";
import { Overline } from "./ui";

/** Gemeinsamer Rahmen der Teilnehmer-Screens: Teamname, optionales Overline rechts, Mitglieder. */
export function ScreenShell({
  groupName, overline, members, meId, confirmedIds, children,
}: {
  groupName: string;
  overline?: string;
  members: Array<Member & { active: boolean }>;
  meId: string;
  confirmedIds?: string[];
  children: ReactNode;
}) {
  return (
    <>
      <Background variant="blur" />
      <div className="flex flex-1 flex-col px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))]">
        <header className="flex items-center justify-between">
          <Overline className="text-white/50">{groupName}</Overline>
          {overline && <Overline className="text-white/50">{overline}</Overline>}
        </header>
        <div className="mt-3">
          <MemberChips members={members} meId={meId} confirmedIds={confirmedIds} />
        </div>
        {children}
      </div>
    </>
  );
}
