/* eslint-disable @next/next/no-img-element */
import { t } from "@/i18n/en";

/**
 * Emblem und Workshop-Titel. Der Titel steht als reiner Text zentriert unter dem Emblem;
 * die Streak-Challenge-Dekoration (türkiser Streak vor der Wortmarke) gehört nicht zu diesem Workshop.
 * `halo` blendet den Glow hinter dem Emblem aus (Lobby: er würde die Kopfzeile überdecken).
 */
export function Logo({ compact = false, halo = true }: { compact?: boolean; halo?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <img alt="CUPRA" src="/design/emblem.svg" className="h-[31px] w-[40px]" />
        <span className="text-[14px] font-medium uppercase leading-none tracking-[1px]">
          {t.appTitle1} {t.appTitle2}
        </span>
      </div>
    );
  }
  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Glow hinter dem Emblem, auf die Spaltenbreite beschnitten, damit er das Dokument nicht verbreitert */}
      {halo && (
        <div aria-hidden className="pointer-events-none absolute inset-x-[-20px] top-[-320px] -z-[1] h-[620px] overflow-hidden">
          <img alt="" src="/design/gradient-shape.webp" className="absolute left-1/2 top-[12px] h-[562px] w-[677px] max-w-none -translate-x-1/2" />
        </div>
      )}
      <img alt="CUPRA" src="/design/emblem.svg" className="relative h-[102px] w-[132px]" />
      <h1 className="mt-[44px] flex flex-col items-center text-center leading-none">
        <span className="text-[30px] font-medium leading-none tracking-[0.5px]">{t.appTitle1}</span>
        <span className="mt-[4px] text-[30px] font-light leading-none tracking-[0.5px]">{t.appTitle2}</span>
      </h1>
    </div>
  );
}
