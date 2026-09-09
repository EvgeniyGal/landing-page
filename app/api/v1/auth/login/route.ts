import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { publicUser, signApiToken } from "@/lib/api/session";

const schema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const email = body.data.email.trim().toLowerCase();
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (!user || user.status !== "active" || !user.passwordHash) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  const valid = await verifyPassword(body.data.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  const accessToken = await signApiToken(user);
  return NextResponse.json({ accessToken, user: publicUser(user) });
}
