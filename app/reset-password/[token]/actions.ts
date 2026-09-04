"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { hashToken } from "@/lib/crypto/tokens";
import { getDb } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";

const passwordSchema = z.string().min(8).max(128);

async function consumeToken(table: typeof passwordResetTokens, token: string) {
  const db = getDb();
  const tokenHash = hashToken(token);
  const row = await db.query.passwordResetTokens.findFirst({
    where: and(eq(table.tokenHash, tokenHash), isNull(table.usedAt)),
  });
  if (!row || row.expiresAt <= new Date()) {
    return null;
  }
  return row;
}

export async function resetPasswordAction(
  token: string,
  _prev: { error?: string; success?: boolean } | null,
  formData: FormData,
) {
  const parsed = passwordSchema.safeParse(String(formData.get("password") ?? ""));
  if (!parsed.success) {
    return { error: "Password must be at least 8 characters." };
  }

  const row = await consumeToken(passwordResetTokens, token);
  if (!row) {
    return { error: "This reset link is invalid or has expired." };
  }

  const db = getDb();
  const now = new Date();
  await db
    .update(users)
    .set({
      passwordHash: await hashPassword(parsed.data),
      updatedAt: now,
    })
    .where(eq(users.id, row.userId));
  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(passwordResetTokens.id, row.id));

  return { success: true };
}
