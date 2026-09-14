/* eslint-disable @next/next/no-img-element */
import { t } from "@/i18n/en";

/** Emblem und Wortmarke wie auf dem Startscreen der Streak Challenge, mit dem Workshop-Titel. */
export function Logo({ compact = false }: { compact?: boolean }) {
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
    <div className="flex flex-col items-center">
      <div className="relative h-[102px] w-[132px]">
        <img
          alt=""
          aria-hidden
          src="/design/gradient-shape.webp"
          className="pointer-events-none absolute -z-[1] max-w-none"
          style={{ left: "-206.8%", top: "-302%", width: "512.9%", height: "551%" }}
        />
        <img alt="CUPRA" src="/design/emblem.svg" className="relative h-[102px] w-[132px]" />
      </div>
      <div className="mt-[48px] w-fit leading-none">
        <div className="flex items-center">
          <img alt="" src="/design/logo-decorations.svg" className="-mb-[13px] -ml-[13px] -mr-[12px] -mt-[12px] h-[57px] w-[89px] shrink-0" />
          <span className="text-[30px] font-medium leading-none">{t.appTitle1}</span>
        </div>
        <span className="block pl-[2px] text-[30px] font-light leading-none">{t.appTitle2}</span>
      </div>
    </div>
  );
}
