import * as SecureStore from "expo-secure-store";
import { getAuthToken, setAuthToken } from "@/src/api/client";

export const ACCESS_TOKEN_KEY = "flashcards_access_token";

export async function readStoredAccessToken() {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function writeStoredAccessToken(token: string | null) {
  try {
    if (token) {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    }
  } catch {
    // SecureStore can fail on some web/dev targets; in-memory token still works for the session.
  }
}

/** Ensures the API client has a Bearer token (needed for background tasks). */
export async function ensureAuthTokenLoaded() {
  const current = getAuthToken();
  if (current) {
    return current;
  }
  const stored = await readStoredAccessToken();
  if (stored) {
    setAuthToken(stored);
  }
  return stored;
}
