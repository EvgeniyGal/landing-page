"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/require-admin";
import { addDuration, generateToken, hashToken, INVITE_TTL_MS, TELEGRAM_LINK_TTL_MS } from "@/lib/crypto/tokens";
import { getDb } from "@/lib/db";
import { inviteTokens, telegramConnections, telegramLinkTokens, users, type UserRole, type UserStatus } from "@/lib/db/schema";
import { sendInviteEmail } from "@/lib/mail/auth-emails";
import { getSiteUrl } from "@/lib/seo";

const emailSchema = z.email();
const roleSchema = z.enum(["admin", "user"]);

async function countActiveAdminsExcluding(userId: string) {
  const db = getDb();
  const admins = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.status, "active")));
  return admins.filter((admin) => admin.id !== userId).length;
}

export async function inviteUserAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const emailParsed = emailSchema.safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  const roleParsed = roleSchema.safeParse(String(formData.get("role") ?? "user"));
  if (!emailParsed.success) {
    return { error: "Enter a valid email address." };
  }
  if (!roleParsed.success) {
    return { error: "Select a valid role." };
  }

  const db = getDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, emailParsed.data),
  });

  let userId = existing?.id;
  if (existing && existing.status !== "invited") {
    return { error: "A user with that email already exists." };
  }

  if (!existing) {
    const [created] = await db
      .insert(users)
      .values({
        email: emailParsed.data,
        role: roleParsed.data,
        status: "invited",
      })
      .returning({ id: users.id });
    userId = created.id;
  } else if (existing.role !== roleParsed.data) {
    await db
      .update(users)
      .set({ role: roleParsed.data, updatedAt: new Date() })
      .where(eq(users.id, existing.id));
  }

  const token = generateToken();
  await db.insert(inviteTokens).values({
    userId: userId!,
    tokenHash: hashToken(token),
    expiresAt: addDuration(INVITE_TTL_MS),
  });

  try {
    await sendInviteEmail(emailParsed.data, token);
  } catch {
    return { error: "User was created but the invitation email could not be sent." };
  }

  revalidatePath("/admin/users");
  return { success: `Invitation sent to ${emailParsed.data}.` };
}

export async function updateUserRoleAction(userId: string, role: UserRole) {
  await requireAdmin();
  if (role === "user") {
    const remaining = await countActiveAdminsExcluding(userId);
    if (remaining < 1) {
      return { error: "Cannot demote the last active admin." };
    }
  }
  const db = getDb();
  await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserStatusAction(userId: string, status: UserStatus) {
  await requireAdmin();
  if (status === "disabled") {
    const remaining = await countActiveAdminsExcluding(userId);
    if (remaining < 1) {
      return { error: "Cannot disable the last active admin." };
    }
  }
  const db = getDb();
  await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/admin/users");
  return { success: true };
}

export async function disconnectTelegramAction(userId: string) {
  await requireAdmin();
  const db = getDb();
  await db.delete(telegramConnections).where(eq(telegramConnections.userId, userId));
  revalidatePath("/admin/users");
  return { success: true };
}

export async function generateConnectLinkAction(
  _prev: { error?: string; url?: string; userId?: string } | null,
  formData: FormData,
) {
  await requireAdmin();
  const userId = String(formData.get("userId") ?? "");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    return { error: "Invalid user.", url: undefined, userId };
  }

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) {
    return { error: "User not found.", url: undefined, userId };
  }

  const token = generateToken();
  await db.insert(telegramLinkTokens).values({
    userId,
    tokenHash: hashToken(token),
    expiresAt: addDuration(TELEGRAM_LINK_TTL_MS),
  });

  const url = new URL(`/connect/telegram/${token}`, getSiteUrl()).toString();
  return { error: undefined, url, userId };
}

export async function listUsers() {
  await requireAdmin();
  const db = getDb();
  return db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      status: users.status,
      telegramUserId: telegramConnections.telegramUserId,
      telegramUsername: telegramConnections.telegramUsername,
    })
    .from(users)
    .leftJoin(telegramConnections, eq(telegramConnections.userId, users.id));
}
