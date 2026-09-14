import { NextResponse } from "next/server";
import { handleError, jsonError } from "@/lib/server/http";
import { buildSessionOverview } from "@/lib/server/snapshot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Trainer-Ansicht: Gruppenübersicht und beide Leaderboards (F1, F2). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const overview = await buildSessionOverview(id);
    if (!overview) return jsonError(404, "SESSION_NOT_FOUND");
    return NextResponse.json(overview);
  } catch (err) {
    return handleError(err);
  }
}
