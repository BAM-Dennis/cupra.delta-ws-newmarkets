import { NextResponse } from "next/server";
import { normalizeCode } from "@/lib/codes";
import { getGroupByCode, getSession, listMembers, touchMember } from "@/lib/repo";
import { handleError, jsonError } from "@/lib/server/http";
import { buildGroupSnapshot } from "@/lib/server/snapshot";
import { GAME_CONFIG } from "@/engine/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Geteilter Gruppenzustand für die Teilnehmer-Devices (Polling). Mit ?since=<version>
 * kommt nur ein kleiner "unverändert"-Body zurück; das Lebenszeichen wird trotzdem gesetzt.
 */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");
  const since = url.searchParams.get("since");
  try {
    const group = await getGroupByCode(normalizeCode(code));
    if (!group) return jsonError(404, "GROUP_NOT_FOUND");
    const session = await getSession(group.session_id);
    if (!session) return jsonError(404, "SESSION_NOT_FOUND");
    if (userId) await touchMember(group.id, userId);

    if (since !== null && Number(since) === group.version) {
      const members = await listMembers(group.id);
      const now = Date.now();
      return NextResponse.json({
        changed: false,
        version: group.version,
        members: members.map((m) => ({
          userId: m.user_id,
          nickname: m.nickname,
          active: now - new Date(m.last_seen_at).getTime() <= GAME_CONFIG.PRESENCE_TIMEOUT_MS,
        })),
      });
    }
    const snapshot = await buildGroupSnapshot(group, session, userId);
    return NextResponse.json({ changed: true, ...snapshot });
  } catch (err) {
    return handleError(err);
  }
}
