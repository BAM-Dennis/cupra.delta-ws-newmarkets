"use client";

import { getPersona } from "@/data/content";
import { t } from "@/i18n/en";
import type { GroupSnapshot } from "@/lib/api";
import { PersonaCard } from "../PersonaCard";
import { ProposalBanner } from "../ProposalBanner";
import { ScreenShell } from "../ScreenShell";
import type { Act } from "../GroupGame";

/** US-3 – Zwei Personas, leicht und schwer, gemeinsame Wahl per Vorschlag und Bestätigung. */
export function PersonaChoiceScreen({ snapshot, meId, busy, act }: { snapshot: GroupSnapshot; meId: string; busy: boolean; act: Act }) {
  const { state, members, session } = snapshot;
  if (state.phase.name !== "persona_choice") return null;
  const { roundIndex, proposal } = state.phase;
  const round = session.rounds[roundIndex];
  const easy = getPersona(round.easyPersonaId);
  const hard = getPersona(round.hardPersonaId);
  if (!easy || !hard) return null;
  const proposedPersona = proposal ? getPersona(proposal.value) : null;

  return (
    <ScreenShell groupName={snapshot.group.name} overline={t.round(roundIndex + 1, session.rounds.length)} members={members} meId={meId}>
      <div className="mt-6 animate-fade-up">
        <h1 className="text-[24px] font-medium leading-none">{t.choosePersona}</h1>
        <p className="mt-2 text-[14px] leading-[1.3] text-white/70">{t.choosePersonaHint}</p>
      </div>
      <div className="mt-5 flex flex-col gap-3">
        {[easy, hard].map((p) => (
          <PersonaCard
            key={p.id}
            persona={p}
            proposed={proposal?.value === p.id}
            disabled={busy || proposal !== null}
            onPropose={proposal ? undefined : () => act({ type: "PROPOSE_PERSONA", personaId: p.id })}
          />
        ))}
      </div>
      {proposal && proposedPersona && (
        <ProposalBanner
          proposal={proposal}
          members={members}
          meId={meId}
          title={`${proposedPersona.name} · ${proposedPersona.difficulty === "hard" ? t.hard : t.easy}`}
          subtitle={proposedPersona.role}
          busy={busy}
          onConfirm={() => act({ type: "CONFIRM" })}
          onReject={() => act({ type: "REJECT" })}
          onWithdraw={() => act({ type: "WITHDRAW" })}
        />
      )}
    </ScreenShell>
  );
}
