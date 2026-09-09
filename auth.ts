import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { linkOrActivateGoogleUser } from "./lib/auth/google";
import { verifyPassword } from "./lib/auth/password";
import { getDb } from "./lib/db";
import { users } from "./lib/db/schema";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.trim().toLowerCase();
        const db = getDb();
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!user || user.status !== "active" || !user.passwordHash) {
          return null;
        }

        const valid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({ allowDangerousEmailAccountLinking: true })]
      : []),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }
      if (!user.email || !account.providerAccountId) {
        return "/login?error=AccessDenied";
      }
      try {
        await linkOrActivateGoogleUser({
          email: user.email,
          name: user.name,
          providerAccountId: account.providerAccountId,
        });
        return true;
      } catch {
        return "/login?error=AccessDenied";
      }
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const db = getDb();
        const row = await db.query.users.findFirst({
          where: eq(users.email, user.email.trim().toLowerCase()),
        });
        if (row) {
          token.sub = row.id;
          token.role = row.role;
          token.status = row.status;
        }
        return token;
      }
      if (user) {
        const typedUser = user as {
          role?: "admin" | "user";
          status?: "invited" | "active" | "disabled";
        };
        if (typedUser.role) {
          token.role = typedUser.role;
        }
        if (typedUser.status) {
          token.status = typedUser.status;
        }
      }
      return token;
    },
  },
});
