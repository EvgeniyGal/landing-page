import assert from "node:assert/strict";
import { test } from "node:test";
import { buildGenerationPrompt } from "../lib/flashcard/prompt";
import { buildPlainTextMessages, isChatModelId } from "../lib/openai/generate";

test("buildGenerationPrompt replaces {{word}}", () => {
  const result = buildGenerationPrompt("Define {{word}} clearly.", "abolish");
  assert.equal(result, "Define abolish clearly.");
});

test("buildGenerationPrompt appends the word when no placeholder exists", () => {
  const result = buildGenerationPrompt("You are a teacher.", "jump-verb");
  assert.match(result, /You are a teacher\./);
  assert.match(result, /Word: jump-verb/);
});

test("buildPlainTextMessages uses only the admin prompt as a user message", () => {
  const messages = buildPlainTextMessages("Define {{word}} clearly.", "abolish");
  assert.deepEqual(messages, [{ role: "user", content: "Define abolish clearly." }]);
  assert.equal(
    messages.some((message) => message.content.toLowerCase().includes("json")),
    false,
  );
});

test("isChatModelId keeps chat models and drops audio/image ids", () => {
  assert.equal(isChatModelId("gpt-4.1"), true);
  assert.equal(isChatModelId("o3-mini"), true);
  assert.equal(isChatModelId("gpt-4o-audio-preview"), false);
  assert.equal(isChatModelId("dall-e-3"), false);
  assert.equal(isChatModelId("text-embedding-3-large"), false);
});
