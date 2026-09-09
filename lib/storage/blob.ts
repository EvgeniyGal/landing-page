import { get, put } from "@vercel/blob";
import type { AudioKind } from "@/lib/db/schema";

type BlobAccess = "public" | "private";

let cachedAccess: BlobAccess | undefined;

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.trim().replace(/^["']|["']$/g, "") || "";
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export function isPrivateStoreError(error: unknown) {
  const message = errorMessage(error).toLowerCase();
  return message.includes("private store") || message.includes("private access");
}

function accessOrder(preferred?: BlobAccess): BlobAccess[] {
  if (preferred === "private" || cachedAccess === "private") {
    return ["private", "public"];
  }
  return ["public", "private"];
}

export async function putAudioBlob(input: {
  userId: string;
  cardId: string;
  kind: AudioKind;
  bytes: Buffer;
}) {
  const token = blobToken();
  if (!token) {
    throw new Error("BLOB_READ_WRITE_TOKEN is missing.");
  }

  const pathname = `flashcards/${input.userId}/${input.cardId}/${input.kind}.mp3`;
  let lastError: unknown;

  for (const access of accessOrder()) {
    try {
      const result = await put(pathname, new Uint8Array(input.bytes), {
        access,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "audio/mpeg",
        token,
      });
      cachedAccess = access;
      return result.url;
    } catch (error) {
      lastError = error;
      const message = errorMessage(error).toLowerCase();
      const retry =
        (access === "public" && isPrivateStoreError(error)) ||
        (access === "private" && message.includes("public") && message.includes("access"));
      if (!retry) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Could not store audio.");
}

export async function readAudioBlob(url: string) {
  const token = blobToken();
  for (const access of accessOrder(cachedAccess)) {
    try {
      const result = await get(url, { access, token: token || undefined });
      if (result?.statusCode !== 200 || !result.stream) {
        continue;
      }
      const bytes = Buffer.from(await new Response(result.stream).arrayBuffer());
      if (!bytes.length) {
        continue;
      }
      cachedAccess = access;
      return bytes;
    } catch {
      // Try the other access mode, then a plain fetch.
    }
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Could not read stored audio.");
  }
  return Buffer.from(await response.arrayBuffer());
}
