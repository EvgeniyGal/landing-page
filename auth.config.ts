import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
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
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "admin" | "user";
        session.user.status = token.status as "invited" | "active" | "disabled";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
