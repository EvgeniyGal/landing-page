import { createHash, randomBytes } from "node:crypto";

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function addDuration(ms: number, from = new Date()): Date {
  return new Date(from.getTime() + ms);
}

export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;
export const TELEGRAM_LINK_TTL_MS = 24 * 60 * 60 * 1000;
