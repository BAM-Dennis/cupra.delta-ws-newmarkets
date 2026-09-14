import { NextResponse } from "next/server";
import { GameError } from "@/engine/game";

export function jsonError(status: number, error: string, message?: string) {
  return NextResponse.json({ error, message }, { status });
}

/** Einheitliche Fehlerbehandlung für Route-Handler. */
export function handleError(err: unknown) {
  if (err instanceof GameError) return jsonError(409, err.code, err.message);
  console.error(err);
  return jsonError(500, "INTERNAL", err instanceof Error ? err.message : undefined);
}
