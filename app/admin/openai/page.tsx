import { getOrCreateSettings } from "@/lib/db/settings";
import { loadOpenaiModels } from "./actions";
import { OpenaiForms } from "./openai-forms";

export const metadata = { title: "OpenAI" };

export default async function OpenaiPage() {
  const settings = await getOrCreateSettings();
  const models = await loadOpenaiModels();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">OpenAI</h1>
        <p className="mt-1 text-sm text-muted-foreground">Store an API key and pick the model used for flashcard generation.</p>
      </div>
      <OpenaiForms
        configured={Boolean(settings.encryptedOpenaiApiKey)}
        last4={settings.openaiApiKeyLast4}
        models={models}
        selectedModel={settings.openaiModel}
      />
    </div>
  );
}
