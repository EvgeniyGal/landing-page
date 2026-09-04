import { auth } from "@/auth";
import type { UserRole } from "@/lib/db/schema";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}

export function isAdminRole(role: UserRole | undefined) {
  return role === "admin";
}
