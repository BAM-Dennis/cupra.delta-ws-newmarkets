/* eslint-disable @next/next/no-img-element */
import { GAME_CONFIG } from "@/engine/config";
import type { PersonaDef } from "@/engine/types";
import { t } from "@/i18n/en";
import { Badge } from "./ui";

/**
 * Persona-Karte für die gemeinsame Wahl (C1): großes Portrait oben, darunter Name, Profil
 * und Zitat. Schwierigkeit und Punktwert offen sichtbar.
 */
export function PersonaCard({
  persona, proposed = false, onPropose, disabled,
}: {
  persona: PersonaDef;
  proposed?: boolean;
  onPropose?: () => void;
  disabled?: boolean;
}) {
  const hard = persona.difficulty === "hard";
  const frame = proposed ? "border-teal bg-teal/15 animate-proposal-glow" : hard ? "border-copper/70 bg-black/20" : "border-white/15 bg-white/5";
  const badges = (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2">
        <Badge tone={hard ? "copper" : "teal"}>{hard ? t.hard : t.easy}</Badge>
        {persona.placeholder && <Badge tone="neutral">{t.placeholder}</Badge>}
      </span>
      <span className="text-[12px] leading-none text-white/60 tabular-nums">{t.worth(GAME_CONFIG.CONVINCED_BONUS[persona.difficulty])}</span>
    </div>
  );
  return (
    <div className={`flex flex-col overflow-hidden rounded-[12px] border backdrop-blur-[10px] ${frame}`}>
      {persona.image && (
        <div className="relative aspect-[4/3] w-full">
          <img alt={persona.name} src={persona.image} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night/90 to-transparent" />
          <div className="absolute inset-x-4 bottom-3">{badges}</div>
        </div>
      )}
      <div className="flex flex-col gap-3 p-4">
        {!persona.image && badges}
        <div>
          <p className="text-[24px] font-medium leading-none">{persona.name}</p>
          <p className="mt-1 text-[13px] leading-[1.3] text-white/60">{persona.profile}</p>
        </div>
        <p className="text-[14px] leading-[1.35] text-white/85">“{persona.intro}”</p>
        {onPropose && (
          <button
            type="button"
            onClick={onPropose}
            disabled={disabled}
            className="mt-1 flex min-h-11 items-center justify-center rounded-[6px] border border-white/25 bg-white/5 text-[13px] font-medium uppercase tracking-[1px] transition active:scale-[0.99] disabled:opacity-40"
          >
            {t.propose}
          </button>
        )}
      </div>
    </div>
  );
}
