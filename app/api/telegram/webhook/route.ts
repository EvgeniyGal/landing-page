import { handleTelegramUpdate, type TelegramUpdate } from "@/lib/telegram/handle-update";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const header = request.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || header !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const update = (await request.json()) as TelegramUpdate;
  await handleTelegramUpdate(update);
  return Response.json({ ok: true });
}
