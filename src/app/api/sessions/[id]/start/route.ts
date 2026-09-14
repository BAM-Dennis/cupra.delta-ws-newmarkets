import { NextResponse } from "next/server";
import { CONTENT } from "@/data/content";
import { reduce } from "@/engine/game";
import { seededRng } from "@/engine/rng";
import { getSession, listGroups, listMembers, saveGroupState, toMember, withTransaction } from "@/lib/repo";
import { handleError, jsonError } from "@/lib/server/http";
import { buildSessionOverview } from "@/lib/server/snapshot";

export const runtime = "nodejs";

/**
 * Trainer startet die Session: leere Gruppen werden entfernt (A4), jede verbleibende
 * Gruppe erhält ihr Deck (B1/B2) und wechselt in die Sichtungsphase.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = req.headers.get("x-trainer-token");
  try {
    const result = await withTransaction(async (client) => {
      const session = await getSession(id, client);
      if (!session) return jsonError(404, "SESSION_NOT_FOUND");
      if (session.trainer_token !== token) return jsonError(403, "TRAINER_TOKEN_MISMATCH");
      if (session.status !== "lobby") return jsonError(409, "ALREADY_STARTED");

      const groups = await listGroups(id, client);
      let dealt = 0;
      for (const group of groups) {
        const members = (await listMembers(group.id, client)).map(toMember);
        if (members.length === 0) {
          await client.query("delete from groups where id = $1", [group.id]);
          continue;
        }
        const next = reduce(
          group.state,
          { type: "DEAL" },
          { members, rounds: session.rounds, content: CONTENT, deckSize: session.config.deckSize, now: Date.now(), rng: seededRng(Date.now() + group.idx) },
        );
        await saveGroupState(group.id, next, client);
        dealt++;
      }
      if (dealt === 0) return jsonError(409, "NO_MEMBERS", "Keine Gruppe hat Mitglieder");
      await client.query("update sessions set status = 'running', started_at = now(), group_count = $2 where id = $1", [id, dealt]);
      const overview = await buildSessionOverview(id, client);
      return NextResponse.json(overview);
    });
    return result;
  } catch (err) {
    return handleError(err);
  }
}
