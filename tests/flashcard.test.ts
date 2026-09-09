import assert from "node:assert/strict";
import { test } from "node:test";
import { generatedCardSchema } from "../lib/flashcard/schema";
import { formatFlashcardText } from "../lib/flashcard/format";
import { isTtsConfigured } from "../lib/elevenlabs/tts";
import { newCardSchedule, previewIntervals, scheduleReview } from "../lib/srs/sm2";
import { parseTtsCallback, ttsCallbackData } from "../lib/telegram/parse";

const sample = {
  word: "abolish",
  partOfSpeech: "verb",
  transcription: "/əˈbɒlɪʃ/",
  irregularForms: null,
  examples: [
    "The government decided to abolish the outdated law.",
    "Many people believe we should abolish unnecessary homework.",
    "The organization aims to abolish child labour.",
  ],
  definition: "to put an end to something",
};

test("generatedCardSchema accepts a complete card", () => {
  assert.equal(generatedCardSchema.parse(sample).word, "abolish");
});

test("formatFlashcardText includes front examples and back definition", () => {
  const text = formatFlashcardText(sample);
  assert.match(text, /Front side:/);
  assert.match(text, /abolish \(verb\)/);
  assert.match(text, /1\. The government/);
  assert.match(text, /Back side:/);
  assert.match(text, /to put an end to something/);
});

test("SM-2 Good on a new card enters the first learning step", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const next = scheduleReview(newCardSchedule(now), "good", now);
  assert.equal(next.state, "learning");
  assert.equal(next.dueAt.getTime() - now.getTime(), 60_000);
});

test("SM-2 Easy on a new card graduates to four days", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const next = scheduleReview(newCardSchedule(now), "easy", now);
  assert.equal(next.state, "review");
  assert.equal(next.intervalDays, 4);
});

test("SM-2 three Goods graduate after both learning steps", () => {
  const now = new Date("2026-01-01T00:00:00Z");
  const first = scheduleReview(newCardSchedule(now), "good", now);
  assert.equal(first.state, "learning");
  const second = scheduleReview(first, "good", first.dueAt);
  assert.equal(second.state, "learning");
  const graduated = scheduleReview(second, "good", second.dueAt);
  assert.equal(graduated.state, "review");
  assert.equal(graduated.intervalDays, 1);
});

test("previewIntervals returns labels for all ratings", () => {
  const labels = previewIntervals(newCardSchedule());
  assert.ok(labels.again);
  assert.ok(labels.hard);
  assert.ok(labels.good);
  assert.ok(labels.easy);
});

test("TTS callback round-trips a card id and kind", () => {
  const id = "11111111-1111-1111-1111-111111111111";
  const data = ttsCallbackData(id, "example_2");
  assert.deepEqual(parseTtsCallback(data), { flashcardId: id, kind: "example_2" });
  assert.equal(parseTtsCallback("nope"), null);
});

test("isTtsConfigured is false without env keys", () => {
  const key = process.env.ELEVENLABS_API_KEY;
  const voice = process.env.ELEVENLABS_VOICE_ID;
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.ELEVENLABS_VOICE_ID;
  assert.equal(isTtsConfigured(), false);
  if (key) process.env.ELEVENLABS_API_KEY = key;
  if (voice) process.env.ELEVENLABS_VOICE_ID = voice;
});

