import { getOrCreateSettings } from "@/lib/db/settings";
import { PromptForm } from "./prompt-form";

export const metadata = { title: "Flashcard prompt" };

export default async function PromptPage() {
  const settings = await getOrCreateSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Flashcard prompt</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This prompt is sent to OpenAI when a linked user sends a word to Telegram. The bot replies with that plain text.
        </p>
      </div>
      <PromptForm prompt={settings.flashcardPrompt} />
    </div>
  );
}
