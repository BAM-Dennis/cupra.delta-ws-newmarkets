"use client";

import { getCard } from "@/data/content";
import { handsOf } from "@/engine/game";
import { t } from "@/i18n/en";
import type { GroupSnapshot } from "@/lib/api";
import { ArgumentCard } from "../ArgumentCard";
import { ScreenShell } from "../ScreenShell";
import { PrimaryButton } from "../ui";

/** US-2 – Eigene Karten sichten und bestätigen. Sichtbar sind nur die eigenen Karten (B3). */
export function CardsScreen({
  snapshot, meId, busy, onConfirm,
}: {
  snapshot: GroupSnapshot;
  meId: string;
  busy: boolean;
  onConfirm: () => void;
}) {
  const { state, members } = snapshot;
  if (state.phase.name !== "cards") return null;
  const mine = handsOf(state, meId);
  const confirmed = state.phase.confirmedBy.includes(meId);
  const activeIds = members.filter((m) => m.active).map((m) => m.userId);
  const done = state.phase.confirmedBy.filter((id) => activeIds.includes(id)).length;

  return (
    <ScreenShell groupName={snapshot.group.name} overline={t.phase.cards} members={members} meId={meId} confirmedIds={state.phase.confirmedBy}>
      <div className="mt-6 animate-fade-up">
        <h1 className="text-[24px] font-medium leading-none">{t.yourCards}</h1>
        <p className="mt-2 text-[14px] leading-[1.3] text-white/70">
          {mine.length > 0 ? t.cardsIntro(mine.length, state.hands.length) : t.cardsNoCards}
        </p>
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {mine.map((h) => {
          const card = getCard(h.cardId);
          return card ? (
            <li key={h.cardId}>
              <ArgumentCard card={card} />
            </li>
          ) : null;
        })}
      </ul>
      <div className="sticky bottom-0 z-20 -mx-5 mt-auto bg-gradient-to-b from-transparent via-night/90 to-night px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-10">
        {confirmed ? (
          <p className="text-center text-[14px] text-white/60 tabular-nums">{t.cardsWaiting(done, activeIds.length)}</p>
        ) : (
          <PrimaryButton onClick={onConfirm} disabled={busy}>
            {t.cardsConfirm}
          </PrimaryButton>
        )}
      </div>
    </ScreenShell>
  );
}
