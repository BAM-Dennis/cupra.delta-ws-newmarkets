"use client";

import { useEffect, useState } from "react";
import { GAME_CONFIG } from "@/engine/config";
import { t } from "@/i18n/en";
import { fetchSession, type GroupSnapshot, type SessionOverview } from "@/lib/api";
import { Leaderboards } from "../Leaderboards";
import { ScreenShell } from "../ScreenShell";
import { SecondaryButton, StatTile } from "../ui";

/**
 * E1/F1/F2 – Spielende der Gruppe mit beiden Leaderboards (Polling, andere Gruppen spielen ggf.
 * noch). Sagt klar, dass das Spiel vorbei ist, und bietet "Start over" für dieses Gerät an.
 */
export function FinishedScreen({ snapshot, meId, onStartOver }: { snapshot: GroupSnapshot; meId: string; onStartOver: () => void }) {
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
        <p className="mt-2 text-[14px] leading-[1.35] text-white/85">{t.finishedText}</p>
        <div className="mt-4 flex gap-2">
          <StatTile label={t.teamScore}>{snapshot.state.score}</StatTile>
          <StatTile label={t.personasConvinced}>{snapshot.state.convincedCount}</StatTile>
          <StatTile label={t.yourPoints} variant="you">{snapshot.state.memberPoints[meId] ?? 0}</StatTile>
        </div>
      </div>
      <div className="mt-8">
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
      <div className="mt-auto flex flex-col gap-2 pb-2 pt-8">
        <SecondaryButton onClick={onStartOver}>{t.startOver}</SecondaryButton>
        <p className="text-center text-[12px] leading-[1.3] text-white/50">{t.startOverHint}</p>
      </div>
    </ScreenShell>
  );
}
