import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { oauthAccounts, users, type User } from "@/lib/db/schema";

export class GoogleAuthError extends Error {
  constructor(
    message: string,
    readonly code: "unknown_email" | "disabled" | "invalid_token",
  ) {
    super(message);
  }
}

export async function linkOrActivateGoogleUser(input: {
  email: string;
  name?: string | null;
  providerAccountId: string;
}): Promise<User> {
  const email = input.email.trim().toLowerCase();
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new GoogleAuthError("This Google account is not invited.", "unknown_email");
  }
  if (user.status === "disabled") {
    throw new GoogleAuthError("This account is disabled.", "disabled");
  }

  if (user.status === "invited") {
    await db
      .update(users)
      .set({
        status: "active",
        name: user.name || input.name || null,
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  } else if (!user.name && input.name) {
    await db
      .update(users)
      .set({ name: input.name, updatedAt: new Date() })
      .where(eq(users.id, user.id));
  }

  await db
    .insert(oauthAccounts)
    .values({
      userId: user.id,
      provider: "google",
      providerAccountId: input.providerAccountId,
    })
    .onConflictDoNothing();

  const fresh = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });
  return fresh ?? { ...user, status: "active" };
}

export async function verifyGoogleIdToken(idToken: string) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!response.ok) {
    throw new GoogleAuthError("Invalid Google token.", "invalid_token");
  }
  const payload = (await response.json()) as {
    aud?: string;
    email?: string;
    email_verified?: string;
    name?: string;
    sub?: string;
  };
  if (!payload.email || !payload.sub) {
    throw new GoogleAuthError("Invalid Google token.", "invalid_token");
  }
  if (clientId && payload.aud && payload.aud !== clientId) {
    throw new GoogleAuthError("Invalid Google token.", "invalid_token");
  }
  if (payload.email_verified === "false") {
    throw new GoogleAuthError("Invalid Google token.", "invalid_token");
  }
  return {
    email: payload.email,
    name: payload.name,
    providerAccountId: payload.sub,
  };
}
