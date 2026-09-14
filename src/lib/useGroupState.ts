"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "@/engine/config";
import { ApiError, fetchGroup, type GroupSnapshot } from "./api";

/**
 * Geteilter Gruppenzustand per Polling (Prototyp). Der Server liefert nur bei geänderter
 * Version den vollen Zustand; Antworten eigener Aktionen werden sofort übernommen.
 * Upgrade-Pfad: SSE oder Supabase Realtime mit identischem Snapshot-Format.
 */
export function useGroupState(code: string, userId: string | null) {
  const [snapshot, setSnapshot] = useState<GroupSnapshot | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const versionRef = useRef<number | undefined>(undefined);

  const apply = useCallback((next: GroupSnapshot) => {
    if (versionRef.current !== undefined && next.version < versionRef.current) return;
    versionRef.current = next.version;
    setSnapshot(next);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    let inFlight = false;
    const tick = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const res = await fetchGroup(code, userId, versionRef.current);
        if (!alive) return;
        if (res.changed) apply(res);
        else setSnapshot((s) => (s ? { ...s, members: res.members } : s));
        setError(null);
      } catch (err) {
        if (alive) setError(err instanceof ApiError ? err : new ApiError(0, "UNREACHABLE"));
      } finally {
        inFlight = false;
      }
    };
    void tick();
    const timer = setInterval(tick, GAME_CONFIG.POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [code, userId, apply]);

  return { snapshot, error, apply };
}
