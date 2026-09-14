"use client";

import type { ArgumentCardDef } from "@/engine/types";
import { t } from "@/i18n/en";
import { Badge } from "./ui";

export type CardVisualState = "idle" | "proposed" | "spent" | "hit" | "miss";

const ROW: Record<CardVisualState, string> = {
  idle: "glass",
  proposed: "border border-teal bg-teal/15 backdrop-blur-[10px] animate-proposal-glow",
  spent: "glass card-spent",
  hit: "border border-correct bg-correct/20 backdrop-blur-[10px]",
  miss: "border border-signal bg-signal/20 backdrop-blur-[10px]",
};

/** Argumentkarte im Glas-Stil der Antwortzeilen aus der Streak Challenge. */
export function ArgumentCard({
  card, state = "idle", onSelect, compact = false,
}: {
  card: ArgumentCardDef;
  state?: CardVisualState;
  onSelect?: () => void;
  compact?: boolean;
}) {
  const interactive = onSelect !== undefined && state === "idle";
  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-medium uppercase leading-[1.2] tracking-[1px] text-copper-light">{card.title}</span>
        {state === "spent" && <Badge tone="neutral">{t.spent}</Badge>}
        {state === "hit" && <Badge tone="correct">{t.hit}</Badge>}
        {state === "miss" && <Badge tone="signal">{t.miss}</Badge>}
      </div>
      {!compact && <p className="text-[14px] leading-[1.3] text-white/85">{card.text}</p>}
    </>
  );
  const cls = `flex w-full flex-col gap-[6px] rounded-[6px] p-[14px] text-left transition-colors ${ROW[state]} ${
    interactive ? "active:bg-white/10" : ""
  }`;
  if (interactive) {
    return (
      <button type="button" onClick={onSelect} className={cls}>
        {content}
      </button>
    );
  }
  return <div className={cls}>{content}</div>;
}
