"use client";

import { useEffect, useState } from "react";
import { GAME_CONFIG } from "@/engine/config";
import { t } from "@/i18n/en";
import { fetchSession, type GroupSnapshot, type SessionOverview } from "@/lib/api";
import { Leaderboards } from "../Leaderboards";
import { ScreenShell } from "../ScreenShell";
import { StatTile } from "../ui";

/** E1/F1/F2 – Spielende der Gruppe mit beiden Leaderboards (Polling, andere Gruppen spielen ggf. noch). */
export function FinishedScreen({ snapshot, meId }: { snapshot: GroupSnapshot; meId: string }) {
  const [overview, setOverview] = useState<SessionOverview | null>(null);
  const sessionId = snapshot.group.sessionId;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const o = await fetchSession(sessionId);
        if (alive) setOverview(o);
      } catch {
        /* nächster Versuch beim nächsten Tick */
      }
    };
    void load();
    const timer = setInterval(load, GAME_CONFIG.TRAINER_POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [sessionId]);

  return (
    <ScreenShell groupName={snapshot.group.name} overline={t.phase.finished} members={snapshot.members} meId={meId}>
      <div className="mt-6 animate-fade-up">
        <h1 className="text-[24px] font-medium leading-none">{t.finishedTitle}</h1>
        <div className="mt-4 flex gap-2">
          <StatTile label={t.teamScore}>{snapshot.state.score}</StatTile>
          <StatTile label={t.personasConvinced}>{snapshot.state.convincedCount}</StatTile>
          <StatTile label={t.yourPoints} variant="you">{snapshot.state.memberPoints[meId] ?? 0}</StatTile>
        </div>
      </div>
      <div className="mt-8 pb-6">
        {overview ? (
          <Leaderboards
            groups={overview.leaderboards.groups}
            individuals={overview.leaderboards.individuals}
            highlightGroupId={snapshot.group.id}
            highlightUserId={meId}
          />
        ) : (
          <p className="py-6 text-center text-[14px] text-white/50">{t.loading}</p>
        )}
      </div>
    </ScreenShell>
  );
}
