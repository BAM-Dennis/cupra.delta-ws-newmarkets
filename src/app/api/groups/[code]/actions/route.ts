import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTENT } from "@/data/content";
import { GAME_CONFIG } from "@/engine/config";
import { reduce } from "@/engine/game";
import type { Action } from "@/engine/types";
import { normalizeCode } from "@/lib/codes";
import { activeMembers, getGroupByCode, getSession, listMembers, saveGroupState, touchMember, withTransaction } from "@/lib/repo";
import { handleError, jsonError } from "@/lib/server/http";
import { buildGroupSnapshot } from "@/lib/server/snapshot";

export const runtime = "nodejs";

const userId = z.string().uuid();
const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("CONFIRM_CARDS"), userId }),
  z.object({ type: z.literal("PROPOSE_PERSONA"), userId, personaId: z.string() }),
  z.object({ type: z.literal("PROPOSE_CARD"), userId, cardId: z.string() }),
  z.object({ type: z.literal("CONFIRM"), userId }),
  z.object({ type: z.literal("REJECT"), userId }),
  z.object({ type: z.literal("WITHDRAW"), userId }),
  z.object({ type: z.literal("CONTINUE"), userId }),
]);
const Body = z.object({ action: ActionSchema });

/**
 * Der technische Kern (Abschnitt 7): Jede Aktion läuft serverseitig durch den Reducer,
 * unter Zeilensperre auf der Gruppe, damit gleichzeitige Bestätigungen konsistent bleiben.
 */
export async function POST(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(400, "INVALID_BODY", parsed.error.message);
  const action = parsed.data.action as Action & { userId: string };
  try {
    return await withTransaction(async (client) => {
      const group = await getGroupByCode(normalizeCode(code), client, true);
      if (!group) return jsonError(404, "GROUP_NOT_FOUND");
      const session = await getSession(group.session_id, client);
      if (!session) return jsonError(404, "SESSION_NOT_FOUND");
      const rows = await listMembers(group.id, client);
      if (!rows.some((r) => r.user_id === action.userId)) return jsonError(403, "NOT_A_MEMBER");
      await touchMember(group.id, action.userId, client);

      const members = activeMembers(rows, GAME_CONFIG.PRESENCE_TIMEOUT_MS, Date.now(), action.userId);
      const next = reduce(group.state, action, {
        members,
        rounds: session.rounds,
        content: CONTENT,
        deckSize: session.config.deckSize,
        now: Date.now(),
        rng: Math.random,
      });
      const version = await saveGroupState(group.id, next, client);
      const snapshot = await buildGroupSnapshot({ ...group, state: next, version }, session, action.userId, client);
      return NextResponse.json(snapshot);
    });
  } catch (err) {
    return handleError(err);
  }
}
