import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: "admin" | "user";
    status: "invited" | "active" | "disabled";
  }

  interface Session {
    user: {
      id: string;
      role: "admin" | "user";
      status: "invited" | "active" | "disabled";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "user";
    status: "invited" | "active" | "disabled";
  }
}
