import { apiRequest } from "./client";
import type {
  AnaglyphBackground,
  AnaglyphProfile,
  AudioKind,
  DeckCounts,
  DeckSummary,
  Flashcard,
  FlashcardWrite,
  ReviewRating,
  User,
  UserPreferences,
} from "./types";

export async function login(email: string, password: string) {
  return apiRequest<{ accessToken: string; user: User }>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export async function loginWithGoogle(idToken: string) {
  return apiRequest<{ accessToken: string; user: User }>("/api/v1/auth/google", {
    method: "POST",
    body: { idToken },
    auth: false,
  });
}

export async function getMe() {
  return apiRequest<{ user: User }>("/api/v1/me");
}

export async function listDecks() {
  return apiRequest<{ decks: DeckSummary[] }>("/api/v1/decks");
}

export async function createDeck(name: string) {
  return apiRequest<{ deck: DeckSummary }>("/api/v1/decks", {
    method: "POST",
    body: { name },
  });
}

export async function deleteDeck(id: string) {
  return apiRequest<{ ok: true }>(`/api/v1/decks/${id}`, { method: "DELETE" });
}

export async function getDeck(id: string) {
  return apiRequest<{
    deck: { id: string; name: string; isDefault: boolean; createdAt: string };
    counts: DeckCounts;
    cards: Flashcard[];
  }>(`/api/v1/decks/${id}`);
}

export async function getStudyQueue(deckId: string) {
  return apiRequest<{
    deck: { id: string; name: string };
    cards: Flashcard[];
  }>(`/api/v1/decks/${deckId}/study`);
}

export async function createFlashcard(inputText: string, deckId?: string) {
  return apiRequest<{ card: Flashcard }>("/api/v1/flashcards", {
    method: "POST",
    body: { inputText, deckId },
  });
}

export async function getFlashcard(id: string) {
  return apiRequest<{ card: Flashcard }>(`/api/v1/flashcards/${id}`);
}

export async function updateFlashcard(id: string, data: FlashcardWrite) {
  return apiRequest<{ card: Flashcard }>(`/api/v1/flashcards/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export async function deleteFlashcard(id: string) {
  return apiRequest<{ ok: true }>(`/api/v1/flashcards/${id}`, { method: "DELETE" });
}

export async function reviewFlashcard(id: string, rating: ReviewRating) {
  return apiRequest<{ card: Flashcard }>(`/api/v1/flashcards/${id}/review`, {
    method: "POST",
    body: { rating },
  });
}

export async function generateAudio(id: string, kind: AudioKind | "all_examples", force = false) {
  return apiRequest<{ audio: Partial<Record<AudioKind, string>> }>(`/api/v1/flashcards/${id}/audio`, {
    method: "POST",
    body: { kind, force },
  });
}

export async function deleteAudio(id: string, kind: AudioKind | "all_examples") {
  return apiRequest<{ ok: true }>(`/api/v1/flashcards/${id}/audio`, {
    method: "DELETE",
    body: { kind },
  });
}

export async function getPreferences() {
  return apiRequest<{ preferences: UserPreferences }>("/api/v1/me/preferences");
}

export async function setPreferences(lazyEyeEnabled: boolean) {
  return apiRequest<{ preferences: UserPreferences }>("/api/v1/me/preferences", {
    method: "PATCH",
    body: { lazyEyeEnabled },
  });
}

export async function listAnaglyphProfiles() {
  return apiRequest<{ profiles: AnaglyphProfile[] }>("/api/v1/anaglyph-profiles");
}

export async function createAnaglyphProfile(input: {
  name: string;
  leftHue: number;
  leftLightness: number;
  rightHue: number;
  rightLightness: number;
  background: AnaglyphBackground;
}) {
  return apiRequest<{ profile: AnaglyphProfile }>("/api/v1/anaglyph-profiles", {
    method: "POST",
    body: input,
  });
}

export async function updateAnaglyphProfile(
  id: string,
  input: Partial<{
    name: string;
    leftHue: number;
    leftLightness: number;
    rightHue: number;
    rightLightness: number;
    background: AnaglyphBackground;
  }>,
) {
  return apiRequest<{ profile: AnaglyphProfile }>(`/api/v1/anaglyph-profiles/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export async function activateAnaglyphProfile(id: string) {
  return apiRequest<{ profile: AnaglyphProfile }>(`/api/v1/anaglyph-profiles/${id}/activate`, {
    method: "POST",
  });
}

export async function deleteAnaglyphProfile(id: string) {
  return apiRequest<{ ok: true }>(`/api/v1/anaglyph-profiles/${id}`, {
    method: "DELETE",
  });
}
