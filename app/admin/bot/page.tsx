import { getOrCreateSettings } from "@/lib/db/settings";
import { BotForm } from "./bot-form";

export const metadata = { title: "Telegram bot" };

export default async function BotPage() {
  const settings = await getOrCreateSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Telegram bot</h1>
        <p className="mt-1 text-sm text-muted-foreground">Connect a bot token so invited users can generate flashcards in Telegram.</p>
      </div>
      <BotForm
        configured={Boolean(settings.encryptedTelegramBotToken)}
        last4={settings.telegramBotTokenLast4}
        username={settings.telegramBotUsername}
      />
    </div>
  );
}
