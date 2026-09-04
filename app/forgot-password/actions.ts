"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { addDuration, generateToken, hashToken, RESET_TTL_MS } from "@/lib/crypto/tokens";
import { getDb } from "@/lib/db";
import { passwordResetTokens, users } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/mail/auth-emails";

const emailSchema = z.email();

export async function requestPasswordResetAction(
  _prev: { message: string } | null,
  formData: FormData,
) {
  const parsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  const generic = {
    message: "If that email is registered, we sent a reset link.",
  };
  if (!parsed.success) {
    return generic;
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, parsed.data),
  });
  if (!user || user.status !== "active") {
    return generic;
  }

  const token = generateToken();
  await db.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash: hashToken(token),
    expiresAt: addDuration(RESET_TTL_MS),
  });

  try {
    await sendPasswordResetEmail(user.email, token);
  } catch {
    return generic;
  }

  return generic;
}
