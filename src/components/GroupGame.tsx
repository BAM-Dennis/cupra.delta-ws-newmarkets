"use client";

import { useCallback, useEffect, useState } from "react";
import type { Action } from "@/engine/types";
import { t } from "@/i18n/en";
import { ApiError, describeError, joinGroup, sendAction } from "@/lib/api";
import { loadStoredUser, saveNickname, type StoredUser } from "@/lib/storage";
import { useGroupState } from "@/lib/useGroupState";
import { Background } from "./Background";
import { CardsScreen } from "./screens/CardsScreen";
import { DialogScreen } from "./screens/DialogScreen";
import { FinishedScreen } from "./screens/FinishedScreen";
import { JoinScreen } from "./screens/JoinScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { PersonaChoiceScreen } from "./screens/PersonaChoiceScreen";
import { PersonaResultScreen } from "./screens/PersonaResultScreen";

type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
/** Aktion ohne userId; die Orchestrierung ergänzt sie. */
export type Act = (action: DistributiveOmit<Extract<Action, { userId: string }>, "userId">) => void;

/** Orchestriert die Teilnehmer-Screens anhand der Phase des geteilten Gruppenzustands. */
export function GroupGame({ code }: { code: string }) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const { snapshot, error, apply } = useGroupState(code, user?.userId ?? null);
  const [busy, setBusy] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // User aus localStorage erst nach dem ersten Paint lesen (Hydration)
  useEffect(() => {
    const id = requestAnimationFrame(() => setUser(loadStoredUser()));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!actionError) return;
    const timer = setTimeout(() => setActionError(null), 3_000);
    return () => clearTimeout(timer);
  }, [actionError]);

  const handleJoin = useCallback(
    async (nickname: string) => {
      if (!user) return;
      setBusy(true);
      setJoinError(null);
      try {
        const snap = await joinGroup(code, user.userId, nickname);
        saveNickname(nickname);
        setUser({ ...user, nickname });
        apply(snap);
      } catch (err) {
        setJoinError(err instanceof ApiError && err.status === 404 ? t.groupNotFound : describeError(err, t.errorUnreachable));
      } finally {
        setBusy(false);
      }
    },
    [code, user, apply],
  );

  const act: Act = useCallback(
    async (action) => {
      if (!user || busy) return;
      setBusy(true);
      try {
        const snap = await sendAction(code, { ...action, userId: user.userId } as Action);
        apply(snap);
      } catch (err) {
        // 409 = Zustand hat sich zwischenzeitlich geändert; der nächste Poll bringt den aktuellen Stand
        if (!(err instanceof ApiError && err.status === 409)) setActionError(t.errorGeneric);
      } finally {
        setBusy(false);
      }
    },
    [code, user, busy, apply],
  );

  if (!user || (!snapshot && !error)) {
    return (
      <>
        <Background variant="blur" />
        <p className="flex flex-1 items-center justify-center text-[14px] text-white/50">{t.loading}</p>
      </>
    );
  }

  if (!snapshot) {
    return (
      <>
        <Background variant="blur" />
        <p className="flex flex-1 items-center justify-center px-5 text-center text-[14px] text-signal">
          {error?.status === 404 ? t.groupNotFound : t.errorUnreachable}
        </p>
      </>
    );
  }

  if (!snapshot.isMember) {
    return <JoinScreen groupName={snapshot.group.name} initialNickname={user.nickname ?? ""} busy={busy} error={joinError} onJoin={handleJoin} />;
  }

  const meId = user.userId;
  let screen: React.ReactNode;
  switch (snapshot.state.phase.name) {
    case "lobby":
      screen = <LobbyScreen snapshot={snapshot} meId={meId} />;
      break;
    case "cards":
      screen = <CardsScreen snapshot={snapshot} meId={meId} busy={busy} onConfirm={() => act({ type: "CONFIRM_CARDS" })} />;
      break;
    case "persona_choice":
      screen = <PersonaChoiceScreen snapshot={snapshot} meId={meId} busy={busy} act={act} />;
      break;
    case "dialog":
      screen = <DialogScreen snapshot={snapshot} meId={meId} busy={busy} act={act} />;
      break;
    case "persona_result":
      screen = <PersonaResultScreen snapshot={snapshot} meId={meId} busy={busy} act={act} />;
      break;
    case "finished":
      screen = <FinishedScreen snapshot={snapshot} meId={meId} />;
      break;
  }

  return (
    <>
      {screen}
      {(actionError || error) && (
        <div className="pointer-events-none fixed inset-x-0 top-[max(8px,env(safe-area-inset-top))] z-50 mx-auto max-w-[430px] px-5">
          <p className="rounded-[6px] border border-signal/60 bg-night/95 px-4 py-2 text-center text-[13px] text-signal animate-fade-up">
            {actionError ?? t.errorUnreachable}
          </p>
        </div>
      )}
    </>
  );
}
