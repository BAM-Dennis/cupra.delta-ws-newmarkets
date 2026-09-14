import { NextResponse } from "next/server";
import { z } from "zod";
import { GAME_CONFIG } from "@/engine/config";
import { normalizeCode } from "@/lib/codes";
import { getGroupByCode, getSession, upsertMember } from "@/lib/repo";
import { handleError, jsonError } from "@/lib/server/http";
import { buildGroupSnapshot } from "@/lib/server/snapshot";

export const runtime = "nodejs";

const Body = z.object({
  userId: z.string().uuid(),
  nickname: z.string().trim().min(GAME_CONFIG.NICKNAME_MIN).max(GAME_CONFIG.NICKNAME_MAX),
});

/** A3 – Teilnehmer tritt per Gruppen-QR seiner Gruppe bei, identifiziert über die persistente User-ID. */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "INVALID_BODY", parsed.error.message);
  try {
    const group = await getGroupByCode(normalizeCode(code));
    if (!group) return jsonError(404, "GROUP_NOT_FOUND");
    const session = await getSession(group.session_id);
    if (!session) return jsonError(404, "SESSION_NOT_FOUND");
    await upsertMember(group.id, parsed.data.userId, parsed.data.nickname);
    const snapshot = await buildGroupSnapshot(group, session, parsed.data.userId);
    return NextResponse.json(snapshot);
  } catch (err) {
    return handleError(err);
  }
}
