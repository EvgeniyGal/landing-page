import { z } from "zod";

export const generatedCardSchema = z.object({
  word: z.string().min(1),
  partOfSpeech: z.string().min(1).nullable(),
  transcription: z.string().min(1),
  irregularForms: z.string().min(1).nullable(),
  examples: z.array(z.string().min(1)).length(3),
  definition: z.string().min(1),
});

export type GeneratedCard = z.infer<typeof generatedCardSchema>;

export const OPENAI_CARD_JSON_SCHEMA = {
  name: "flashcard",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      word: { type: "string" },
      partOfSpeech: { type: ["string", "null"] },
      transcription: { type: "string" },
      irregularForms: { type: ["string", "null"] },
      examples: {
        type: "array",
        minItems: 3,
        maxItems: 3,
        items: { type: "string" },
      },
      definition: { type: "string" },
    },
    required: ["word", "partOfSpeech", "transcription", "irregularForms", "examples", "definition"],
  },
} as const;

export const JSON_SYSTEM_PROMPT = `You create English vocabulary flashcards.
Return only JSON matching the schema.
If the user includes a hyphenated part of speech (e.g. jump-verb), use that part of speech.
If the input is a phrase, treat the whole phrase as the headword.
Use IPA transcription.
If the headword is an irregular verb, set irregularForms to the three forms like go/went/gone; otherwise null.
Write three natural example sentences.
Write a short definition in simple words. Do not start the definition with the part of speech.`;
