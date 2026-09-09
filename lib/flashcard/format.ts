import type { GeneratedCard } from "./schema";

export function stripDuplicatePosPrefix(definition: string, partOfSpeech: string | null) {
  let trimmed = definition.trim();
  if (!partOfSpeech) {
    return trimmed;
  }
  const escaped = partOfSpeech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^\\(\\s*${escaped}\\s*\\)\\s*`, "i");
  while (pattern.test(trimmed)) {
    trimmed = trimmed.replace(pattern, "").trim();
  }
  return trimmed;
}

export function formatBackDefinition(definition: string, partOfSpeech: string | null) {
  const body = stripDuplicatePosPrefix(definition, partOfSpeech);
  if (!partOfSpeech) {
    return body;
  }
  return `(${partOfSpeech}) ${body}`;
}

export function formatFlashcardText(card: GeneratedCard): string {
  const pos = card.partOfSpeech ? ` (${card.partOfSpeech})` : "";
  const head = card.irregularForms || card.word;
  const examples = card.examples.map((sentence, index) => `${index + 1}. ${sentence}`).join("\n");

  return `Front side:
${head}${pos}

${card.transcription}

${examples}

Back side:
${formatBackDefinition(card.definition, card.partOfSpeech)}`;
}

export function displayHeadword(card: Pick<GeneratedCard, "word" | "irregularForms">) {
  return card.irregularForms || card.word;
}
