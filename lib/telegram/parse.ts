export type TelegramUser = {
  id: number;
  username?: string;
};

export type TelegramMessage = {
  message_id: number;
  from?: TelegramUser;
  chat: { id: number };
  text?: string;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
};

export function parseStartPayload(text: string): string | null {
  const match = text.trim().match(/^\/start(?:@\w+)?(?:\s+(.+))?$/);
  if (!match) {
    return null;
  }
  const payload = match[1]?.trim();
  return payload ? payload : "";
}

export function isSlashCommand(text: string) {
  return text.trim().startsWith("/");
}

export const INVITE_ONLY_REPLY =
  "This bot is invite-only. Ask an admin for a connection link before sending words.";

export const LINK_SUCCESS_REPLY =
  "Your Telegram account is connected. Send a word to generate a flashcard.";

export const LINK_INVALID_REPLY = "This connection link is invalid or has expired.";

export const LINK_TELEGRAM_TAKEN_REPLY =
  "This Telegram account is already connected to another user.";

export const LINK_USER_TAKEN_REPLY =
  "This account is already connected. Ask an admin to disconnect it first.";

export const NOT_CONFIGURED_REPLY =
  "Flashcard generation is not configured yet. Please try again later.";

export const GENERATION_ERROR_REPLY =
  "I could not generate a flashcard right now. Please try again in a moment.";
