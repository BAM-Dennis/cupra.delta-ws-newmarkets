"use client";

import type { Member, Proposal } from "@/engine/types";
import { t } from "@/i18n/en";
import { PrimaryButton, SecondaryButton } from "./ui";

/**
 * Konsens-Spielzug (D2): zeigt den offenen Vorschlag. Der Vorschlagende wartet und kann
 * zurückziehen, alle anderen bestätigen oder lehnen ab.
 */
export function ProposalBanner({
  proposal, members, meId, title, subtitle, onConfirm, onReject, onWithdraw, busy,
}: {
  proposal: Proposal;
  members: Array<Member & { active: boolean }>;
  meId: string;
  title: string;
  subtitle?: string;
  onConfirm: () => void;
  onReject: () => void;
  onWithdraw: () => void;
  busy: boolean;
}) {
  const proposer = members.find((m) => m.userId === proposal.proposerId);
  const required = members.filter((m) => m.active).length;
  const done = proposal.confirmedBy.filter((id) => members.some((m) => m.userId === id && m.active)).length;
  const mine = proposal.proposerId === meId;
  const iConfirmed = proposal.confirmedBy.includes(meId);

  return (
    <div className="sticky bottom-0 z-20 -mx-5 mt-auto bg-gradient-to-b from-transparent via-night/95 to-night px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-8">
      <div className="flex flex-col gap-3 rounded-[12px] border border-teal/60 bg-teal-tint p-4 shadow-glow animate-slide-up" style={{ backgroundColor: "#1f1e29" }}>
        <p className="text-[10px] font-medium uppercase leading-none tracking-[1px] text-teal">{t.proposedBy(proposer?.nickname ?? "?")}</p>
        <p className="text-[16px] font-medium leading-[1.2]">{title}</p>
        {subtitle && <p className="text-[13px] leading-[1.3] text-white/70">{subtitle}</p>}
        <p className="text-[12px] leading-none text-white/60 tabular-nums">{t.waitingForTeam(done, required)}</p>
        {mine || iConfirmed ? (
          <SecondaryButton onClick={onWithdraw} disabled={busy || !mine}>
            {mine ? t.withdraw : "…"}
          </SecondaryButton>
        ) : (
          <div className="flex gap-2">
            <SecondaryButton onClick={onReject} disabled={busy}>
              {t.reject}
            </SecondaryButton>
            <PrimaryButton onClick={onConfirm} disabled={busy}>
              {t.confirm}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
