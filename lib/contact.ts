import formData from "form-data";
import Mailgun from "mailgun.js";
import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  company: z.string().max(120).optional().or(z.literal("")),
  message: z.string().min(10).max(5000),
});

export type ContactPayload = z.infer<typeof contactSchema>;

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function getMailgunConfig() {
  return {
    apiKey: requiredEnv("MAILGUN_API_KEY"),
    domain: requiredEnv("MAILGUN_DOMAIN"),
    from: requiredEnv("MAILGUN_FROM_EMAIL"),
    to: requiredEnv("CONTACT_TO_EMAIL"),
  };
}

export async function sendContactNotification(input: ContactPayload) {
  const config = getMailgunConfig();
  const mailgun = new Mailgun(formData);
  const client = mailgun.client({ username: "api", key: config.apiKey });

  const submittedAt = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const subject = `New Automation Inquiry • ${input.name}`;
  const textBody = [
    "New automation inquiry received",
    `Submitted: ${submittedAt}`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Company: ${input.company || "N/A"}`,
    "",
    "Message:",
    input.message,
  ].join("\n");
  const escapedMessage = input.message
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br/>");
  const htmlBody = `
    <div style="margin:0;padding:24px;background:#0b1326;font-family:Inter,Segoe UI,Arial,sans-serif;color:#dae2fd;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:700px;margin:0 auto;border-collapse:collapse;">
        <tr>
          <td style="background:#131b2e;border:1px solid rgba(136,145,157,0.25);border-radius:14px;padding:24px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#98cbff;font-weight:700;">
              New Inquiry
            </p>
            <h1 style="margin:0 0 20px;font-size:24px;line-height:1.2;color:#dae2fd;">
              New automation inquiry from ${input.name}
            </h1>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:20px;">
              <tr>
                <td style="padding:8px 0;color:#bec7d4;font-size:13px;width:120px;">Submitted</td>
                <td style="padding:8px 0;color:#dae2fd;font-size:14px;font-weight:600;">${submittedAt}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#bec7d4;font-size:13px;">Name</td>
                <td style="padding:8px 0;color:#dae2fd;font-size:14px;font-weight:600;">${input.name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#bec7d4;font-size:13px;">Email</td>
                <td style="padding:8px 0;color:#dae2fd;font-size:14px;font-weight:600;">${input.email}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#bec7d4;font-size:13px;">Company</td>
                <td style="padding:8px 0;color:#dae2fd;font-size:14px;font-weight:600;">${input.company || "N/A"}</td>
              </tr>
            </table>
            <div style="margin-top:16px;padding:16px;background:#222a3d;border-radius:10px;border:1px solid rgba(136,145,157,0.2);">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#98cbff;font-weight:700;">
                Message
              </p>
              <p style="margin:0;font-size:15px;line-height:1.65;color:#dae2fd;">
                ${escapedMessage}
              </p>
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  return client.messages.create(config.domain, {
    from: config.from,
    to: [config.to],
    subject,
    text: textBody,
    html: htmlBody,
  });
}
