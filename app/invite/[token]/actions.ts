"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/crypto/tokens";
import { getDb } from "@/lib/db";
import { inviteTokens, users } from "@/lib/db/schema";

const passwordSchema = z.string().min(8).max(128);

export async function acceptInviteAction(
  token: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const parsed = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!parsed.success) {
    return { error: "Password must be at least 8 characters." };
  }

  const db = getDb();
  const tokenHash = hashToken(token);
  const row = await db.query.inviteTokens.findFirst({
    where: and(eq(inviteTokens.tokenHash, tokenHash), isNull(inviteTokens.usedAt)),
  });
  if (!row || row.expiresAt <= new Date()) {
    return { error: "This invitation link is invalid or has expired." };
  }

  const now = new Date();
  await db
    .update(users)
    .set({
      passwordHash: await hashPassword(parsed.data),
      status: "active",
      emailVerified: now,
      updatedAt: now,
    })
    .where(eq(users.id, row.userId));
  await db.update(inviteTokens).set({ usedAt: now }).where(eq(inviteTokens.id, row.id));

  return { success: true };
}
