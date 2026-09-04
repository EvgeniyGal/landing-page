import OpenAI from "openai";
import { buildGenerationPrompt } from "@/lib/flashcard/prompt";

const EXCLUDED_MODEL_FRAGMENTS = [
  "audio",
  "realtime",
  "tts",
  "whisper",
  "transcribe",
  "embedding",
  "moderation",
  "dall-e",
  "image",
  "vision-preview",
  "instruct",
  "search",
  "computer-use",
];

export function isChatModelId(id: string) {
  const lower = id.toLowerCase();
  if (EXCLUDED_MODEL_FRAGMENTS.some((fragment) => lower.includes(fragment))) {
    return false;
  }
  return (
    lower.startsWith("gpt-") ||
    lower.startsWith("o1") ||
    lower.startsWith("o3") ||
    lower.startsWith("o4") ||
    lower.startsWith("chatgpt")
  );
}

export async function listChatModels(apiKey: string): Promise<string[]> {
  const client = new OpenAI({ apiKey });
  const models = await client.models.list();
  return models.data
    .map((model) => model.id)
    .filter(isChatModelId)
    .sort((a, b) => a.localeCompare(b));
}

export async function generateFlashcardContent(input: {
  apiKey: string;
  model: string;
  prompt: string;
  word: string;
}): Promise<string> {
  const client = new OpenAI({ apiKey: input.apiKey });
  const completion = await client.chat.completions.create({
    model: input.model,
    messages: [{ role: "user", content: buildGenerationPrompt(input.prompt, input.word) }],
    temperature: 0.4,
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned empty content");
  }
  return text;
}
