import { getSiteUrl } from "@/lib/seo";

type TelegramApiResponse<T> =
  | { ok: true; result: T }
  | { ok: false; description?: string };

export async function telegramApi<T>(token: string, method: string, body?: unknown): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await response.json()) as TelegramApiResponse<T>;
  if (!json.ok) {
    throw new Error(json.description || `Telegram ${method} failed`);
  }
  return json.result;
}

export function getTelegramWebhookUrl() {
  return new URL("/api/telegram/webhook", getSiteUrl()).toString();
}

export async function validateAndRegisterBot(token: string) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing required env var: TELEGRAM_WEBHOOK_SECRET");
  }

  const me = await telegramApi<{ id: number; username?: string }>(token, "getMe");
  await telegramApi(token, "setWebhook", {
    url: getTelegramWebhookUrl(),
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
  });

  return {
    botId: me.id,
    username: me.username ?? "",
  };
}

export type InlineKeyboard = {
  inline_keyboard: { text: string; callback_data: string }[][];
};

export async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  replyMarkup?: InlineKeyboard,
) {
  await telegramApi(token, "sendMessage", {
    chat_id: chatId,
    text,
    reply_markup: replyMarkup,
  });
}

export async function sendTelegramAudio(token: string, chatId: number, audioUrl: string, title?: string) {
  await telegramApi(token, "sendAudio", {
    chat_id: chatId,
    audio: audioUrl,
    title,
  });
}

export async function answerCallbackQuery(token: string, callbackQueryId: string, text?: string) {
  await telegramApi(token, "answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}
