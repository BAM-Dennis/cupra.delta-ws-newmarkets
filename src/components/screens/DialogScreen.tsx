"use client";

import { getCard, getPersona } from "@/data/content";
import { handsOf, openHands } from "@/engine/game";
import { t } from "@/i18n/en";
import type { GroupSnapshot } from "@/lib/api";
import { ArgumentCard, type CardVisualState } from "../ArgumentCard";
import { ProposalBanner } from "../ProposalBanner";
import { ScreenShell } from "../ScreenShell";
import { Badge, Overline } from "../ui";
import type { Act } from "../GroupGame";

/** US-4/US-5 – Persona nennt einen Need, die Gruppe spielt per Konsens eine Karte, die Persona reagiert. */
export function DialogScreen({ snapshot, meId, busy, act }: { snapshot: GroupSnapshot; meId: string; busy: boolean; act: Act }) {
  const { state, members, session } = snapshot;
  if (state.phase.name !== "dialog") return null;
  const { roundIndex, personaId, needIndex, hits, proposal, lastMove } = state.phase;
  const persona = getPersona(personaId);
  if (!persona) return null;
  const need = persona.needs[needIndex];
  const mine = handsOf(state, meId);
  const proposedCard = proposal ? getCard(proposal.value) : null;
  const lastCard = lastMove ? getCard(lastMove.cardId) : null;
  // Treffer-Stärke je Need dieser Persona in dieser Runde für die Punktanzeige
  const roundMoves = state.moves.filter((m) => m.roundIndex === roundIndex && m.personaId === personaId);
  const dotTone = (i: number) => {
    const mv = roundMoves[i];
    if (!mv) return "bg-white/20";
    if (mv.strength === "full") return "bg-correct";
    if (mv.strength === "partial") return "bg-warn";
    return "bg-signal/70";
  };

  const visual = (cardId: string, played: boolean): CardVisualState => {
    if (played) return "spent";
    if (proposal?.value === cardId) return "proposed";
    return "idle";
  };

  return (
    <ScreenShell groupName={snapshot.group.name} overline={t.round(roundIndex + 1, session.rounds.length)} members={members} meId={meId}>
      {/* Persona-Kopf */}
      <div className="mt-5 flex items-end justify-between gap-3 animate-fade-up">
        <div className="min-w-0">
          <p className="text-[24px] font-medium leading-none">{persona.name}</p>
          <p className="mt-1 truncate text-[13px] leading-[1.3] text-white/60">{persona.profile}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge tone={persona.difficulty === "hard" ? "copper" : "teal"}>{persona.difficulty === "hard" ? t.hard : t.easy}</Badge>
          <span className="flex items-center gap-[3px]" aria-label={`${t.hits}: ${hits}`}>
            {persona.needs.map((n, i) => (
              <span key={n.id} className={`size-[8px] rounded-full ${dotTone(i)}`} />
            ))}
          </span>
        </div>
      </div>

      {/* Reaktion auf die letzte Karte */}
      {lastMove && lastCard && (
        <div key={lastMove.cardId} className="mt-4 rounded-[12px] border border-white/10 bg-black/20 p-4 animate-bubble-in">
          <div className="flex items-center justify-between gap-2">
            <Overline className="text-white/50">{lastCard.title}</Overline>
            <Badge tone={lastMove.strength === "full" ? "correct" : lastMove.strength === "partial" ? "warn" : "signal"}>
              {lastMove.strength === "full" ? `${t.hit} +${lastMove.points}` : lastMove.strength === "partial" ? `${t.partial} +${lastMove.points}` : t.miss}
            </Badge>
          </div>
          <p className="mt-2 text-[14px] italic leading-[1.35] text-white/80">“{lastMove.reaction}”</p>
        </div>
      )}

      {/* Aktueller Need */}
      <div key={need.id} className="mt-3 rounded-[12px] border border-teal/40 bg-teal/10 p-4 backdrop-blur-[10px] animate-bubble-in">
        <Overline className="text-teal">{t.needLabel(needIndex + 1, persona.needs.length)}</Overline>
        <p className="mt-2 text-[18px] leading-[1.3]">“{need.text}”</p>
      </div>

      {/* Eigene Karten */}
      <div className="mt-6 flex items-center justify-between">
        <Overline className="text-white/50">{t.yourCards}</Overline>
        <span className="text-[11px] leading-none text-white/40 tabular-nums">{t.teamCardsLeft(openHands(state).length)}</span>
      </div>
      {!proposal && (
        <p className="mt-2 text-[13px] leading-[1.3] text-white/60">
          {mine.some((h) => h.state === "open") ? t.playCardHint : t.cardsNoCards}
        </p>
      )}
      <ul className="mt-3 flex flex-col gap-2 pb-4">
        {mine.map((h) => {
          const card = getCard(h.cardId);
          if (!card) return null;
          const st = visual(h.cardId, h.state === "played");
          return (
            <li key={h.cardId}>
              <ArgumentCard
                card={card}
                state={st}
                compact={st === "spent"}
                onSelect={st === "idle" && !proposal && !busy ? () => act({ type: "PROPOSE_CARD", cardId: h.cardId }) : undefined}
              />
            </li>
          );
        })}
      </ul>

      {proposal && proposedCard && (
        <ProposalBanner
          proposal={proposal}
          members={members}
          meId={meId}
          title={proposedCard.title}
          subtitle={proposedCard.text}
          busy={busy}
          onConfirm={() => act({ type: "CONFIRM" })}
          onReject={() => act({ type: "REJECT" })}
          onWithdraw={() => act({ type: "WITHDRAW" })}
        />
      )}
    </ScreenShell>
  );
}
