import assert from "node:assert/strict";
import test from "node:test";
import { contactSchema, getMailgunConfig } from "../lib/contact";

test("contactSchema accepts valid payload", () => {
  const parsed = contactSchema.safeParse({
    name: "Jane Doe",
    email: "jane@example.com",
    company: "Acme",
    message: "Please automate our invoice and approval workflow.",
  });

  assert.equal(parsed.success, true);
});

test("contactSchema rejects invalid payload", () => {
  const parsed = contactSchema.safeParse({
    name: "",
    email: "not-an-email",
    message: "short",
  });

  assert.equal(parsed.success, false);
});

test("getMailgunConfig requires env vars", () => {
  delete process.env.MAILGUN_API_KEY;
  delete process.env.MAILGUN_DOMAIN;
  delete process.env.MAILGUN_FROM_EMAIL;
  delete process.env.CONTACT_TO_EMAIL;

  assert.throws(() => getMailgunConfig(), /Missing required env var/);
});
