import OpenAI from "openai";
import { buildGenerationPrompt } from "@/lib/flashcard/prompt";
import {
  generatedCardSchema,
  JSON_SYSTEM_PROMPT,
  OPENAI_CARD_JSON_SCHEMA,
  type GeneratedCard,
} from "@/lib/flashcard/schema";

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

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced?.[1]?.trim() || text.trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("OpenAI returned empty content");
  }
  return JSON.parse(raw.slice(start, end + 1)) as unknown;
}

export function buildPlainTextMessages(prompt: string, word: string) {
  return [{ role: "user" as const, content: buildGenerationPrompt(prompt, word) }];
}

export async function generatePlainTextReply(input: {
  apiKey: string;
  model: string;
  prompt: string;
  word: string;
}): Promise<string> {
  const client = new OpenAI({ apiKey: input.apiKey });
  const completion = await client.chat.completions.create({
    model: input.model,
    messages: buildPlainTextMessages(input.prompt, input.word),
    temperature: 0.4,
  });
  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI returned empty content");
  }
  return text;
}

export async function generateFlashcardContent(input: {
  apiKey: string;
  model: string;
  prompt: string;
  word: string;
}): Promise<GeneratedCard> {
  const client = new OpenAI({ apiKey: input.apiKey });
  const userContent = buildGenerationPrompt(input.prompt, input.word);

  try {
    const completion = await client.chat.completions.create({
      model: input.model,
      messages: [
        { role: "system", content: JSON_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
      response_format: {
        type: "json_schema",
        json_schema: OPENAI_CARD_JSON_SCHEMA,
      },
    });
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error("OpenAI returned empty content");
    }
    return generatedCardSchema.parse(JSON.parse(text));
  } catch (error) {
    const completion = await client.chat.completions.create({
      model: input.model,
      messages: [
        { role: "system", content: `${JSON_SYSTEM_PROMPT}\nRespond with a JSON object only.` },
        { role: "user", content: userContent },
      ],
      temperature: 0.4,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw error instanceof Error ? error : new Error("OpenAI returned empty content");
    }
    return generatedCardSchema.parse(extractJson(text));
  }
}
