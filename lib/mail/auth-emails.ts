import formData from "form-data";
import Mailgun from "mailgun.js";
import { getSiteUrl } from "@/lib/seo";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getMailgunClient() {
  const mailgun = new Mailgun(formData);
  return {
    client: mailgun.client({ username: "api", key: requiredEnv("MAILGUN_API_KEY") }),
    domain: requiredEnv("MAILGUN_DOMAIN"),
    from: requiredEnv("MAILGUN_FROM_EMAIL"),
  };
}

async function sendMail(to: string, subject: string, text: string) {
  const { client, domain, from } = getMailgunClient();
  await client.messages.create(domain, { from, to, subject, text });
}

export async function sendInviteEmail(to: string, token: string) {
  const url = new URL(`/invite/${encodeURIComponent(token)}`, getSiteUrl()).toString();
  await sendMail(
    to,
    "You're invited — set your password",
    [
      "You've been invited to the flashcard platform.",
      "Set your password using this link (expires in 7 days):",
      url,
    ].join("\n"),
  );
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = new URL(`/reset-password/${encodeURIComponent(token)}`, getSiteUrl()).toString();
  await sendMail(
    to,
    "Reset your password",
    [
      "We received a request to reset your password.",
      "If you made this request, open this link (expires in 1 hour):",
      url,
      "",
      "If you did not request a reset, you can ignore this email.",
    ].join("\n"),
  );
}
