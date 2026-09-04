import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { decryptSecret, encryptSecret, last4 } from "../lib/crypto/encryption";

before(() => {
  process.env.APP_ENCRYPTION_KEY = "unit-test-encryption-key";
});

after(() => {
  delete process.env.APP_ENCRYPTION_KEY;
});

test("encryptSecret round-trips plaintext", () => {
  const secret = "sk-test-openai-key";
  const encrypted = encryptSecret(secret);
  assert.notEqual(encrypted, secret);
  assert.equal(decryptSecret(encrypted), secret);
});

test("encryptSecret produces unique ciphertexts", () => {
  const secret = "123456:ABCDEF";
  assert.notEqual(encryptSecret(secret), encryptSecret(secret));
});

test("last4 returns the trailing characters", () => {
  assert.equal(last4("sk-abcdef1234"), "1234");
});
