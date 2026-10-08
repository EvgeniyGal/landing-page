export type UserRole = "admin" | "user";
export type UserStatus = "invited" | "active" | "disabled";
export type CardState = "new" | "learning" | "review" | "relearning";
export type ReviewRating = "again" | "hard" | "good" | "easy";
export type AudioKind = "word" | "example_1" | "example_2" | "example_3";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  status: UserStatus;
};

export type DeckSummary = {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
  cardsDueToday: number;
  cardCount: number;
};

export type DeckCounts = {
  new: number;
  learning: number;
  review: number;
  due: number;
};

export type Flashcard = {
  id: string;
  deckId: string;
  inputText: string;
  outputText: string;
  word: string;
  partOfSpeech: string | null;
  transcription: string | null;
  irregularForms: string | null;
  examples: string[];
  definition: string;
  state: CardState;
  dueAt: string;
  ease: number;
  intervalDays: number;
  audio: Partial<Record<AudioKind, string>>;
  intervals?: Partial<Record<ReviewRating, string>>;
};

export type FlashcardWrite = {
  word: string;
  partOfSpeech: string | null;
  transcription: string;
  irregularForms: string | null;
  examples: [string, string, string];
  definition: string;
};

export type AnaglyphBackground = "black" | "gray" | "white";

export type AnaglyphProfile = {
  id: string;
  name: string;
  isActive: boolean;
  leftHue: number;
  leftLightness: number;
  rightHue: number;
  rightLightness: number;
  background: AnaglyphBackground;
  createdAt: string;
  updatedAt: string;
};

export type UserPreferences = {
  lazyEyeEnabled: boolean;
  wordTextScale: number;
  exampleTextScale: number;
  explanationTextScale: number;
  srsIntervalModifier: number;
  srsStartingEase: number;
  srsEasyBonus: number;
  srsHardInterval: number;
};

export type PreferencesPatch = {
  lazyEyeEnabled?: boolean;
  wordTextScale?: number;
  exampleTextScale?: number;
  explanationTextScale?: number;
  srsIntervalModifier?: number;
  srsStartingEase?: number;
  srsEasyBonus?: number;
  srsHardInterval?: number;
};

export type ApiErrorBody = {
  error?: string;
  code?: string;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}
