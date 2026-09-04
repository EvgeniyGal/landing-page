import assert from "node:assert/strict";
import { test } from "node:test";
import { splitTelegramMessage } from "../lib/telegram/messages";
import { isSlashCommand, parseStartPayload } from "../lib/telegram/parse";

test("parseStartPayload reads a /start token", () => {
  assert.equal(parseStartPayload("/start abc_token"), "abc_token");
  assert.equal(parseStartPayload("/start@mybot abc_token"), "abc_token");
  assert.equal(parseStartPayload("/start"), "");
  assert.equal(parseStartPayload("abolish"), null);
});

test("isSlashCommand detects bot commands", () => {
  assert.equal(isSlashCommand("/help"), true);
  assert.equal(isSlashCommand("abolish"), false);
});

test("splitTelegramMessage keeps short text intact", () => {
  assert.deepEqual(splitTelegramMessage("hello"), ["hello"]);
});

test("splitTelegramMessage splits long text on newlines when possible", () => {
  const first = "a".repeat(50);
  const second = "b".repeat(50);
  const chunks = splitTelegramMessage(`${first}\n${second}`, 60);
  assert.equal(chunks.length, 2);
  assert.equal(chunks.join(""), `${first}${second}`);
});
