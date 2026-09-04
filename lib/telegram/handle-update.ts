import { decryptSecret } from "@/lib/crypto/encryption";
import { getOrCreateSettings } from "@/lib/db/settings";
import { createFlashcardForUser } from "@/lib/flashcard/create";
import { sendTelegramMessage } from "./api";
import { findUserIdByTelegram, linkTelegramAccount } from "./linking";
import { splitTelegramMessage } from "./messages";
import {
  GENERATION_ERROR_REPLY,
  INVITE_ONLY_REPLY,
  LINK_INVALID_REPLY,
  LINK_SUCCESS_REPLY,
  LINK_TELEGRAM_TAKEN_REPLY,
  LINK_USER_TAKEN_REPLY,
  NOT_CONFIGURED_REPLY,
  isSlashCommand,
  parseStartPayload,
  type TelegramUpdate,
} from "./parse";

export type { TelegramUpdate };

async function getBotToken() {
  const settings = await getOrCreateSettings();
  if (!settings.encryptedTelegramBotToken) {
    return null;
  }
  return decryptSecret(settings.encryptedTelegramBotToken);
}

async function reply(chatId: number, text: string) {
  const token = await getBotToken();
  if (!token) {
    return;
  }
  for (const chunk of splitTelegramMessage(text)) {
    await sendTelegramMessage(token, chatId, chunk);
  }
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  const message = update.message;
  const text = message?.text?.trim();
  const from = message?.from;
  if (!message || !text || !from) {
    return;
  }

  const startPayload = parseStartPayload(text);
  if (startPayload !== null) {
    if (!startPayload) {
      await reply(message.chat.id, INVITE_ONLY_REPLY);
      return;
    }

    const result = await linkTelegramAccount({
      rawToken: startPayload,
      telegramUserId: String(from.id),
      telegramUsername: from.username,
    });

    if (result.ok) {
      await reply(message.chat.id, LINK_SUCCESS_REPLY);
      return;
    }

    const replies = {
      invalid_token: LINK_INVALID_REPLY,
      telegram_taken: LINK_TELEGRAM_TAKEN_REPLY,
      user_taken: LINK_USER_TAKEN_REPLY,
    } as const;
    await reply(message.chat.id, replies[result.reason]);
    return;
  }

  const userId = await findUserIdByTelegram(String(from.id));
  if (!userId) {
    await reply(message.chat.id, INVITE_ONLY_REPLY);
    return;
  }

  if (isSlashCommand(text)) {
    await reply(message.chat.id, "Send a word to generate a flashcard.");
    return;
  }

  try {
    const generated = await createFlashcardForUser({ userId, word: text });
    if (!generated.ok) {
      await reply(message.chat.id, NOT_CONFIGURED_REPLY);
      return;
    }
    await reply(message.chat.id, generated.outputText);
  } catch {
    await reply(message.chat.id, GENERATION_ERROR_REPLY);
  }
}
