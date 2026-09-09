import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, type User } from "@/lib/db/schema";

const TOKEN_TTL = "30d";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing required env var: AUTH_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export async function signApiToken(user: Pick<User, "id" | "email" | "role" | "status">) {
  return new SignJWT({
    role: user.role,
    status: user.status,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(secretKey());
}

export async function userFromApiRequest(request: NextRequest): Promise<User | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const userId = payload.sub;
    if (!userId) {
      return null;
    }
    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    if (!user || user.status !== "active") {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export function publicUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}
