"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GAME_CONFIG } from "@/engine/config";
import { t } from "@/i18n/en";
import { createSession, describeError } from "@/lib/api";
import { loadLastSession, saveTrainerToken } from "@/lib/storage";
import { Background } from "../Background";
import { Logo } from "../Logo";
import { ErrorText, PrimaryButton, SecondaryButton, TextField } from "../ui";

/** US-1 – Trainer legt die Anzahl der Gruppen fest (Default vier) und erzeugt die Session. */
export function SessionSetup() {
  const router = useRouter();
  const [groupCount, setGroupCount] = useState(String(GAME_CONFIG.DEFAULT_GROUP_COUNT));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLastSession(loadLastSession()));
    return () => cancelAnimationFrame(id);
  }, []);

  const n = Number(groupCount);
  const valid = Number.isInteger(n) && n >= GAME_CONFIG.MIN_GROUP_COUNT && n <= GAME_CONFIG.MAX_GROUP_COUNT;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await createSession(n);
      saveTrainerToken(res.sessionId, res.trainerToken);
      router.push(`/trainer/${res.sessionId}`);
    } catch (err) {
      setError(describeError(err, t.errorUnreachable));
      setBusy(false);
    }
  };

  return (
    <>
      <Background variant="start" />
      <form
        className="relative flex flex-1 flex-col px-5 pb-[max(40px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="mt-[calc(14dvh-16px)]">
          <Logo />
        </div>
        <div className="mt-10 flex flex-col items-center gap-[13px]">
          <p className="text-center text-[20px] font-medium leading-none">{t.trainerTitle}</p>
          <label htmlFor="groups" className="mt-2 text-center text-[12px] leading-[1.2] tracking-[0.48px]">
            {t.trainerGroups} ({GAME_CONFIG.MIN_GROUP_COUNT}–{GAME_CONFIG.MAX_GROUP_COUNT})
          </label>
          <TextField id="groups" type="number" inputMode="numeric" value={groupCount} onChange={setGroupCount} />
          {error && <ErrorText>{error}</ErrorText>}
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <PrimaryButton type="submit" disabled={!valid || busy}>
            {busy ? "…" : t.trainerCreate}
          </PrimaryButton>
          {lastSession && <SecondaryButton href={`/trainer/${lastSession}`}>{t.trainerResume}</SecondaryButton>}
        </div>
      </form>
    </>
  );
}
