"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { t } from "@/i18n/en";
import { normalizeCode } from "@/lib/codes";
import { Background } from "./Background";
import { Logo } from "./Logo";
import { PrimaryButton, SecondaryButton, TextField } from "./ui";

/** Startseite: Hinweis für Teilnehmer (QR), manuelle Code-Eingabe, Einstieg für den Trainer. */
export function Landing() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const valid = normalizeCode(code).length === 6;
  return (
    <>
      <Background variant="start" />
      <form
        className="relative flex flex-1 flex-col px-5 pb-[max(40px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) router.push(`/join/${normalizeCode(code)}`);
        }}
      >
        <div className="mt-[calc(14dvh-16px)]">
          <Logo />
        </div>
        <p className="mt-6 text-center text-[16px] leading-[1.3] text-white/75">{t.landingIntro}</p>
        <div className="mt-10 flex flex-col gap-[13px]">
          <p className="text-center text-[12px] leading-[1.2] tracking-[0.48px]">{t.landingParticipants}</p>
          <p className="text-center text-[12px] leading-[1.2] tracking-[0.48px] text-white/50">{t.landingEnterCode}</p>
          <TextField id="code" value={code} onChange={setCode} maxLength={6} placeholder="ABC123" />
          <PrimaryButton type="submit" disabled={!valid}>
            {t.landingJoin}
          </PrimaryButton>
          <SecondaryButton href="/trainer">{t.landingTrainer}</SecondaryButton>
        </div>
      </form>
    </>
  );
}
