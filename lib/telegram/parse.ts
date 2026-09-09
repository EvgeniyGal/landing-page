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

export type TelegramCallbackQuery = {
  id: string;
  from: TelegramUser;
  data?: string;
  message?: TelegramMessage;
};

export type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
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

export type TtsCallbackKind = "word" | "example_1" | "example_2" | "example_3" | "all_examples";

const KIND_CODES: Record<string, TtsCallbackKind> = {
  w: "word",
  "1": "example_1",
  "2": "example_2",
  "3": "example_3",
  a: "all_examples",
};

export function parseTtsCallback(data: string) {
  const match = data.match(/^t:([0-9a-f-]{36}):([w123a])$/i);
  if (!match) {
    return null;
  }
  const kind = KIND_CODES[match[2]];
  if (!kind) {
    return null;
  }
  return { flashcardId: match[1], kind };
}

export function ttsCallbackData(flashcardId: string, kind: TtsCallbackKind) {
  const code =
    kind === "word" ? "w" : kind === "all_examples" ? "a" : kind.replace("example_", "");
  return `t:${flashcardId}:${code}`;
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

export const TTS_UNAVAILABLE_REPLY = "Voice generation is not configured yet.";
