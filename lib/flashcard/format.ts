import type { GeneratedCard } from "./schema";

export function formatFlashcardText(card: GeneratedCard): string {
  const pos = card.partOfSpeech ? ` (${card.partOfSpeech})` : "";
  const head = card.irregularForms || card.word;
  const examples = card.examples.map((sentence, index) => `${index + 1}. ${sentence}`).join("\n");
  const backPos = card.partOfSpeech ? `(${card.partOfSpeech}) ` : "";

  return `Front side:
${head}${pos}

${card.transcription}

${examples}

Back side:
${backPos}${card.definition}`;
}

export function displayHeadword(card: Pick<GeneratedCard, "word" | "irregularForms">) {
  return card.irregularForms || card.word;
}
