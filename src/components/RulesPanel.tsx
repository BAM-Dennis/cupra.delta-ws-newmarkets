"use client";

import { t } from "@/i18n/en";
import { Overline } from "./ui";

/**
 * Kurze Spielregeln vor der ersten Runde: jede Karte nur einmal, manche Needs passen nur zu
 * einer Karte, die schwere Persona bringt mehr Punkte. Mit `onDismiss` wegklickbar.
 */
export function RulesPanel({ onDismiss, className = "" }: { onDismiss?: () => void; className?: string }) {
  return (
    <section className={`glass flex flex-col gap-3 rounded-[12px] p-4 ${className}`} aria-label={t.howItWorks}>
      <div className="flex items-center justify-between gap-2">
        <Overline className="text-teal">{t.howItWorks}</Overline>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="-my-1 -mr-2 rounded-[6px] px-2 py-1 text-[11px] font-medium uppercase tracking-[1px] text-white/60 transition active:scale-[0.98] active:text-white"
          >
            {t.gotIt}
          </button>
        )}
      </div>
      <ol className="flex flex-col gap-2">
        {t.rules.map((rule, i) => (
          <li key={i} className="flex gap-3 text-[14px] leading-[1.35] text-white/85">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-copper-gradient text-[11px] font-medium leading-none text-white tabular-nums">
              {i + 1}
            </span>
            <span>{rule}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
