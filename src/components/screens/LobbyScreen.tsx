import { t } from "@/i18n/en";
import type { GroupSnapshot } from "@/lib/api";
import { Logo } from "../Logo";
import { RulesPanel } from "../RulesPanel";
import { ScreenShell } from "../ScreenShell";

/** Lobby: Warten auf den Trainer; die Wartezeit zeigt die Spielregeln, damit die Dynamik vorab klar ist. */
export function LobbyScreen({ snapshot, meId }: { snapshot: GroupSnapshot; meId: string }) {
  return (
    <ScreenShell groupName={snapshot.group.name} overline={t.phase.lobby} members={snapshot.members} meId={meId}>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8 animate-fade-up">
        <Logo halo={false} />
        <div className="flex flex-col items-center gap-3">
          <p className="max-w-[280px] text-center text-[16px] leading-[1.3] text-white/75">{t.lobbyWaiting}</p>
          <span className="size-2 rounded-full bg-teal animate-bar-pulse" />
        </div>
        <RulesPanel className="w-full" />
      </div>
    </ScreenShell>
  );
}
