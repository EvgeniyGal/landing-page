import { put } from "@vercel/blob";
import type { AudioKind } from "@/lib/db/schema";

export async function putAudioBlob(input: {
  userId: string;
  cardId: string;
  kind: AudioKind;
  bytes: Buffer;
}) {
  const pathname = `flashcards/${input.userId}/${input.cardId}/${input.kind}.mp3`;
  const result = await put(pathname, input.bytes, {
    access: "public",
    addRandomSuffix: false,
    contentType: "audio/mpeg",
    allowOverwrite: true,
  });
  return result.url;
}
