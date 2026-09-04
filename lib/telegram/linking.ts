import { and, eq, isNull } from "drizzle-orm";
import { hashToken } from "@/lib/crypto/tokens";
import { getDb } from "@/lib/db";
import { telegramConnections, telegramLinkTokens } from "@/lib/db/schema";

export type LinkResult =
  | { ok: true }
  | { ok: false; reason: "invalid_token" | "telegram_taken" | "user_taken" };

export async function linkTelegramAccount(input: {
  rawToken: string;
  telegramUserId: string;
  telegramUsername?: string;
}): Promise<LinkResult> {
  const db = getDb();
  const tokenHash = hashToken(input.rawToken);
  const now = new Date();

  const tokenRow = await db.query.telegramLinkTokens.findFirst({
    where: and(
      eq(telegramLinkTokens.tokenHash, tokenHash),
      isNull(telegramLinkTokens.usedAt),
    ),
  });

  if (!tokenRow || tokenRow.expiresAt <= now) {
    return { ok: false, reason: "invalid_token" };
  }

  const existingTelegram = await db.query.telegramConnections.findFirst({
    where: eq(telegramConnections.telegramUserId, input.telegramUserId),
  });
  if (existingTelegram) {
    return { ok: false, reason: "telegram_taken" };
  }

  const existingUser = await db.query.telegramConnections.findFirst({
    where: eq(telegramConnections.userId, tokenRow.userId),
  });
  if (existingUser) {
    return { ok: false, reason: "user_taken" };
  }

  await db.insert(telegramConnections).values({
    userId: tokenRow.userId,
    telegramUserId: input.telegramUserId,
    telegramUsername: input.telegramUsername,
  });

  await db
    .update(telegramLinkTokens)
    .set({ usedAt: now })
    .where(eq(telegramLinkTokens.id, tokenRow.id));

  return { ok: true };
}

export async function findUserIdByTelegram(telegramUserId: string) {
  const db = getDb();
  const connection = await db.query.telegramConnections.findFirst({
    where: eq(telegramConnections.telegramUserId, telegramUserId),
  });
  return connection?.userId ?? null;
}
