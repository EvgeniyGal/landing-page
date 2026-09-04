export function buildGenerationPrompt(template: string, word: string): string {
  const trimmedWord = word.trim();
  if (template.includes("{{word}}")) {
    return template.replaceAll("{{word}}", trimmedWord);
  }
  return `${template.trim()}\n\nWord: ${trimmedWord}`;
}
