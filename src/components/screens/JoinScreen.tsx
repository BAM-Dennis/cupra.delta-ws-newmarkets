"use client";

import { useState } from "react";
import { GAME_CONFIG } from "@/engine/config";
import { t } from "@/i18n/en";
import { Background } from "../Background";
import { Logo } from "../Logo";
import { ErrorText, PrimaryButton, TextField } from "../ui";

/** A3 – Beitritt zur Gruppe nach dem QR-Scan; die User-ID kommt aus dem localStorage. */
export function JoinScreen({
  groupName, initialNickname, busy, error, onJoin,
}: {
  groupName: string;
  initialNickname: string;
  busy: boolean;
  error: string | null;
  onJoin: (nickname: string) => void;
}) {
  const [nickname, setNickname] = useState(initialNickname);
  const trimmed = nickname.trim();
  const valid = trimmed.length >= GAME_CONFIG.NICKNAME_MIN && trimmed.length <= GAME_CONFIG.NICKNAME_MAX;
  return (
    <>
      <Background variant="start" />
      <form
        className="relative flex flex-1 flex-col px-5 pb-[max(40px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))]"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid && !busy) onJoin(trimmed);
        }}
      >
        <div className="mt-[calc(14dvh-16px)]">
          <Logo />
        </div>
        <div className="mt-10 flex flex-col items-center gap-[13px]">
          <p className="text-center text-[20px] font-medium leading-none">{t.joinTitle(groupName)}</p>
          <label htmlFor="nickname" className="mt-2 text-center text-[12px] leading-[1.2] tracking-[0.48px]">
            {t.nickname}
          </label>
          <TextField id="nickname" value={nickname} onChange={setNickname} maxLength={GAME_CONFIG.NICKNAME_MAX} placeholder={t.nicknamePlaceholder} autoFocus />
          {error && <ErrorText>{error}</ErrorText>}
        </div>
        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!valid || busy}>
            {busy ? "…" : t.join}
          </PrimaryButton>
        </div>
      </form>
    </>
  );
}
