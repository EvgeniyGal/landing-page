import type { CardState } from "@/src/api/types";
import { colors } from "@/src/theme";

export function cardHead(word: string, irregularForms?: string | null) {
  return irregularForms?.trim() || word;
}

export function stateMeta(state: CardState) {
  switch (state) {
    case "new":
      return { label: "New", ...colors.stateNew };
    case "learning":
      return { label: "Learning", ...colors.stateLearning };
    case "relearning":
      return { label: "Relearning", ...colors.stateRelearning };
    case "review":
    default:
      return { label: "Review", ...colors.stateReview };
  }
}

export function stripDuplicatePosPrefix(definition: string, partOfSpeech?: string | null) {
  const pos = partOfSpeech?.trim();
  if (!pos) {
    return definition;
  }
  const prefix = `(${pos})`;
  if (definition.trimStart().startsWith(prefix)) {
    return definition.trimStart().slice(prefix.length).trimStart();
  }
  return definition;
}

export function messageFromError(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof Error && error.message) {
    if (/localhost|127\.0\.0\.1|ConnectException|Network request failed/i.test(error.message)) {
      return "Cannot reach the server. Check EXPO_PUBLIC_API_URL (use https://aiautomations.work for production).";
    }
    return error.message;
  }
  return fallback;
}
