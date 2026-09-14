import { NextResponse } from "next/server";
import { z } from "zod";
import { ROUNDS } from "@/data/content";
import { GAME_CONFIG } from "@/engine/config";
import { initialState } from "@/engine/game";
import { randomCode } from "@/lib/codes";
import { withTransaction } from "@/lib/repo";
import { handleError, jsonError } from "@/lib/server/http";

export const runtime = "nodejs";

const Body = z.object({
  groupCount: z.number().int().min(GAME_CONFIG.MIN_GROUP_COUNT).max(GAME_CONFIG.MAX_GROUP_COUNT).default(GAME_CONFIG.DEFAULT_GROUP_COUNT),
  deckSize: z.number().int().min(1).max(60).default(GAME_CONFIG.DECK_SIZE),
});

/** A1/A2 – Trainer legt Session mit n Gruppen an; jede Gruppe erhält einen Kurzcode für ihren QR. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "INVALID_BODY", parsed.error.message);
  const { groupCount, deckSize } = parsed.data;
  try {
    const result = await withTransaction(async (client) => {
      const { rows } = await client.query<{ id: string; trainer_token: string }>(
        "insert into sessions (group_count, rounds, config) values ($1, $2, $3) returning id, trainer_token",
        [groupCount, JSON.stringify(ROUNDS), JSON.stringify({ deckSize })],
      );
      const session = rows[0];
      for (let i = 0; i < groupCount; i++) {
        await client.query("insert into groups (session_id, idx, name, code, state) values ($1, $2, $3, $4, $5)", [
          session.id,
          i,
          `Team ${i + 1}`,
          randomCode(),
          JSON.stringify(initialState()),
        ]);
      }
      return session;
    });
    return NextResponse.json({ sessionId: result.id, trainerToken: result.trainer_token });
  } catch (err) {
    return handleError(err);
  }
}
