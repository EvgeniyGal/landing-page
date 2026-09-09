import { decryptSecret } from "@/lib/crypto/encryption";
import { getOrCreateSettings } from "@/lib/db/settings";
import { AUDIO_KINDS, getOrCreateAudioBatch } from "@/lib/flashcard/audio";
import { createFlashcardForUser } from "@/lib/flashcard/create";
import { isTtsConfigured } from "@/lib/elevenlabs/tts";
import { readAudioBlob } from "@/lib/storage/blob";
import { answerCallbackQuery, sendTelegramAudio, sendTelegramMessage, type InlineKeyboard } from "./api";
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
  TTS_UNAVAILABLE_REPLY,
  isSlashCommand,
  parseStartPayload,
  parseTtsCallback,
  ttsCallbackData,
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

function ttsKeyboard(flashcardId: string): InlineKeyboard {
  return {
    inline_keyboard: [
      [{ text: "Voice: word", callback_data: ttsCallbackData(flashcardId, "word") }],
      [
        { text: "Ex. 1", callback_data: ttsCallbackData(flashcardId, "example_1") },
        { text: "Ex. 2", callback_data: ttsCallbackData(flashcardId, "example_2") },
        { text: "Ex. 3", callback_data: ttsCallbackData(flashcardId, "example_3") },
      ],
      [{ text: "Voice: all examples", callback_data: ttsCallbackData(flashcardId, "all_examples") }],
    ],
  };
}

async function reply(chatId: number, text: string, replyMarkup?: InlineKeyboard) {
  const token = await getBotToken();
  if (!token) {
    return;
  }
  const chunks = splitTelegramMessage(text);
  for (const [index, chunk] of chunks.entries()) {
    const markup = index === chunks.length - 1 ? replyMarkup : undefined;
    await sendTelegramMessage(token, chatId, chunk, markup);
  }
}

async function handleCallback(update: TelegramUpdate) {
  const callback = update.callback_query;
  if (!callback?.data || !callback.message) {
    return;
  }
  const token = await getBotToken();
  if (!token) {
    return;
  }

  const userId = await findUserIdByTelegram(String(callback.from.id));
  if (!userId) {
    await answerCallbackQuery(token, callback.id, "This bot is invite-only.");
    return;
  }

  const parsed = parseTtsCallback(callback.data);
  if (!parsed) {
    await answerCallbackQuery(token, callback.id);
    return;
  }

  if (!isTtsConfigured()) {
    await answerCallbackQuery(token, callback.id, TTS_UNAVAILABLE_REPLY);
    return;
  }

  await answerCallbackQuery(token, callback.id, "Generating voice…");
  const chatId = callback.message.chat.id;
  const kinds = parsed.kind === "all_examples" ? AUDIO_KINDS.filter((kind) => kind !== "word") : [parsed.kind];
  const results = await getOrCreateAudioBatch({
    userId,
    flashcardId: parsed.flashcardId,
    kinds,
  });

  for (const item of results) {
    if (!item.result.ok) {
      await sendTelegramMessage(token, chatId, TTS_UNAVAILABLE_REPLY);
      return;
    }
    await sendTelegramAudio(token, chatId, await readAudioBlob(item.result.url), item.kind);
  }
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) {
    try {
      await handleCallback(update);
    } catch {
      const token = await getBotToken();
      if (token && update.callback_query) {
        await answerCallbackQuery(token, update.callback_query.id, "Could not generate voice.");
      }
    }
    return;
  }

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
    await reply(
      message.chat.id,
      generated.outputText,
      isTtsConfigured() ? ttsKeyboard(generated.flashcard.id) : undefined,
    );
  } catch {
    await reply(message.chat.id, GENERATION_ERROR_REPLY);
  }
}
