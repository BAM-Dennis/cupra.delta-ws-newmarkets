"use client";

import { getPersona } from "@/data/content";
import { t } from "@/i18n/en";
import type { GroupSnapshot } from "@/lib/api";
import { ScreenShell } from "../ScreenShell";
import { Badge, PrimaryButton, StatTile } from "../ui";
import type { Act } from "../GroupGame";

/** D6/E2 – Persona überzeugt oder nicht, Bonus nach Schwierigkeit. */
export function PersonaResultScreen({ snapshot, meId, busy, act }: { snapshot: GroupSnapshot; meId: string; busy: boolean; act: Act }) {
  const { state, members, session } = snapshot;
  if (state.phase.name !== "persona_result") return null;
  const { outcome, roundIndex } = state.phase;
  const persona = getPersona(outcome.personaId);
  if (!persona) return null;

  return (
    <ScreenShell groupName={snapshot.group.name} overline={t.round(roundIndex + 1, session.rounds.length)} members={members} meId={meId}>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 animate-pop">
        <Badge tone={outcome.convinced ? "correct" : "signal"} className="text-[12px]">
          {outcome.convinced ? t.convinced : t.notConvinced}
        </Badge>
        <div className="text-center">
          <p className="text-[32px] font-medium leading-none">{persona.name}</p>
          <p className="mt-2 text-[14px] text-white/60">{t.hitsOf(outcome.hits, outcome.needsPlayed)}</p>
        </div>
        <p className="max-w-[300px] text-center text-[16px] italic leading-[1.35] text-white/85">
          “{outcome.convinced ? persona.convinced : persona.notConvinced}”
        </p>
        <div className="flex w-full gap-2">
          <StatTile label={t.hits}>{`${outcome.hits}/${outcome.needsPlayed}`}</StatTile>
          <StatTile label={t.bonus(outcome.bonusPoints).replace(/^\+\d+ /, "")}>{`+${outcome.bonusPoints}`}</StatTile>
          <StatTile label={t.teamScore} variant="you">{state.score}</StatTile>
        </div>
      </div>
      <div className="mt-auto pb-2">
        <PrimaryButton onClick={() => act({ type: "CONTINUE" })} disabled={busy}>
          {t.continue}
        </PrimaryButton>
      </div>
    </ScreenShell>
  );
}
