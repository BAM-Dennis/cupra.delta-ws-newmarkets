"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { getPersona } from "@/data/content";
import { GAME_CONFIG } from "@/engine/config";
import { t } from "@/i18n/en";
import { ApiError, fetchSession, startSession, type GroupOverview, type SessionOverview } from "@/lib/api";
import { loadTrainerToken } from "@/lib/storage";
import { Background } from "../Background";
import { Leaderboards } from "../Leaderboards";
import { Logo } from "../Logo";
import { Badge, ErrorText, Overline, Panel, PrimaryButton, SecondaryButton } from "../ui";

/* eslint-disable @next/next/no-img-element */

/** A2 – QR-Code je Gruppe, Link auf /join/<code>. */
function QrTile({ group }: { group: GroupOverview }) {
  const [qr, setQr] = useState<{ src: string; url: string } | null>(null);
  useEffect(() => {
    let alive = true;
    const url = `${window.location.origin}/join/${group.code}`;
    void QRCode.toDataURL(url, { margin: 1, width: 512, color: { dark: "#1b1a23", light: "#ffffff" } }).then((src) => {
      if (alive) setQr({ src, url });
    });
    return () => {
      alive = false;
    };
  }, [group.code]);
  return (
    <Panel className="items-center text-center">
      <p className="text-[20px] font-medium leading-none">{group.name}</p>
      <div className="aspect-square w-full max-w-[220px] overflow-hidden rounded-[8px] bg-white p-2">
        {qr && <img alt={`QR ${group.name}`} src={qr.src} className="size-full" />}
      </div>
      <p className="text-[22px] font-medium leading-none tracking-[3px] tabular-nums">{group.code}</p>
      <p className="break-all text-[11px] leading-[1.3] text-white/40">{qr?.url}</p>
      <Badge tone={group.members.length > 0 ? "teal" : "neutral"}>{t.trainerJoined(group.members.length)}</Badge>
      {group.members.length > 0 && (
        <p className="text-[12px] leading-[1.4] text-white/70">{group.members.map((m) => m.nickname).join(", ")}</p>
      )}
    </Panel>
  );
}

/** Live-Kachel einer Gruppe: Phase, Runde, Persona, Punkte, Karten. */
function GroupTile({ group, rounds }: { group: GroupOverview; rounds: number }) {
  const persona = group.personaId ? getPersona(group.personaId) : null;
  const tone = group.phase === "finished" ? "correct" : group.pendingProposal ? "teal" : "neutral";
  return (
    <Panel className="gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[20px] font-medium leading-none">{group.name}</p>
        <Badge tone={tone}>{group.pendingProposal ? t.pendingProposal : t.phase[group.phase]}</Badge>
      </div>
      <p className="text-[13px] leading-[1.3] text-white/60">
        {group.roundIndex !== null && `${t.round(group.roundIndex + 1, rounds)}`}
        {persona && ` · ${persona.name} (${persona.difficulty === "hard" ? t.hard : t.easy})`}
      </p>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-[6px] bg-white/5 p-2">
          <p className="text-[8px] font-medium uppercase text-white/60">{t.score}</p>
          <p className="text-[20px] font-medium leading-none tabular-nums">{group.score}</p>
        </div>
        <div className="rounded-[6px] bg-white/5 p-2">
          <p className="text-[8px] font-medium uppercase text-white/60">{t.personasConvinced}</p>
          <p className="text-[20px] font-medium leading-none tabular-nums">{group.convincedCount}</p>
        </div>
        <div className="rounded-[6px] bg-white/5 p-2">
          <p className="text-[8px] font-medium uppercase text-white/60">{t.cards}</p>
          <p className="text-[20px] font-medium leading-none tabular-nums">
            {group.cardsLeft}
            <span className="text-[12px] text-white/40">/{group.cardsTotal}</span>
          </p>
        </div>
      </div>
      <ul className="flex flex-wrap gap-[6px]">
        {group.members.map((m) => (
          <li key={m.userId} className={`flex items-center gap-[6px] rounded-full border border-white/10 bg-white/5 px-[10px] py-[5px] text-[12px] leading-none ${m.active ? "" : "opacity-40"}`}>
            <span className={`size-[6px] rounded-full ${m.active ? "bg-correct" : "bg-white/40"}`} />
            {m.nickname}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Trainer-/Beamer-Ansicht: Lobby mit QR-Codes, danach Live-Übersicht und Leaderboards (F1, F2). */
export function TrainerLive({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<SessionOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showQr, setShowQr] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setToken(loadTrainerToken(sessionId)));
    return () => cancelAnimationFrame(id);
  }, [sessionId]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const o = await fetchSession(sessionId);
        if (alive) {
          setData(o);
          setError(null);
        }
      } catch (err) {
        if (alive) setError(err instanceof ApiError && err.status === 404 ? t.groupNotFound : t.errorUnreachable);
      }
    };
    void load();
    const timer = setInterval(load, GAME_CONFIG.TRAINER_POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [sessionId]);

  const handleStart = async () => {
    if (!token || busy) return;
    setBusy(true);
    try {
      setData(await startSession(sessionId, token));
    } catch (err) {
      setError(err instanceof ApiError ? `${err.code}${err.message && err.message !== err.code ? `: ${err.message}` : ""}` : t.errorUnreachable);
    } finally {
      setBusy(false);
    }
  };

  const lobby = data?.session.status === "lobby";
  const qrVisible = showQr ?? lobby ?? true;
  const anyMembers = data?.groups.some((g) => g.members.length > 0) ?? false;

  return (
    <>
      <Background variant="blur" wide />
      <div className="flex flex-1 flex-col px-6 pb-10 pt-6 md:px-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Logo compact />
          <div className="flex items-center gap-3">
            {data && (
              <Overline className="text-white/50">
                {lobby ? t.phase.lobby : `${data.groups.length} teams · ${data.session.rounds.length} rounds`}
              </Overline>
            )}
            {data && !lobby && (
              <SecondaryButton onClick={() => setShowQr(!qrVisible)} className="!w-auto !min-h-9 !py-2 !text-[12px]">
                {qrVisible ? t.trainerHideQr : t.trainerShowQr}
              </SecondaryButton>
            )}
          </div>
        </header>

        {error && <div className="mt-4"><ErrorText>{error}</ErrorText></div>}
        {!data && !error && <p className="py-10 text-center text-[14px] text-white/50">{t.loading}</p>}

        {data && qrVisible && (
          <section className="mt-8">
            <h1 className="text-center text-[28px] font-medium leading-none">{t.trainerScan}</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.groups.map((g) => <QrTile key={g.id} group={g} />)}
            </div>
            {lobby && (
              <div className="mx-auto mt-8 flex max-w-[430px] flex-col items-center gap-3">
                {token ? (
                  <PrimaryButton onClick={handleStart} disabled={busy || !anyMembers}>
                    {busy ? "…" : t.trainerStart}
                  </PrimaryButton>
                ) : (
                  <ErrorText>{t.trainerNoToken}</ErrorText>
                )}
                <p className="text-[12px] text-white/50">{t.trainerStartHint}</p>
              </div>
            )}
          </section>
        )}

        {data && !lobby && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.groups.map((g) => <GroupTile key={g.id} group={g} rounds={data.session.rounds.length} />)}
            </section>
            <section className="mt-10">
              <Leaderboards groups={data.leaderboards.groups} individuals={data.leaderboards.individuals} columns />
            </section>
          </>
        )}
      </div>
    </>
  );
}
