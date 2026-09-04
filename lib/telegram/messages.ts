export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

export function splitTelegramMessage(
  text: string,
  maxLength = TELEGRAM_MAX_MESSAGE_LENGTH,
): string[] {
  if (text.length <= maxLength) {
    return [text.length ? text : " "];
  }

  const chunks: string[] = [];
  let remaining = text;
  while (remaining.length > maxLength) {
    let splitAt = remaining.lastIndexOf("\n", maxLength);
    if (splitAt < maxLength / 2) {
      splitAt = remaining.lastIndexOf(" ", maxLength);
    }
    if (splitAt < maxLength / 2) {
      splitAt = maxLength;
    }
    chunks.push(remaining.slice(0, splitAt).trimEnd());
    remaining = remaining.slice(splitAt).trimStart();
  }
  if (remaining.length) {
    chunks.push(remaining);
  }
  return chunks;
}
