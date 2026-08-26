"use client";

import { FormEvent, useState } from "react";
import { Locale, translateContent } from "@/app/data/site-content";

type ContactState = {
  name: string;
  email: string;
  company: string;
  message: string;
};

const initialState: ContactState = {
  name: "",
  email: "",
  company: "",
  message: "",
};

type ContactFormProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
};

export function ContactForm({ isOpen, onClose, locale }: ContactFormProps) {
  const content = translateContent(locale).copy.contact;
  const [form, setForm] = useState<ContactState>(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        setStatus("error");
        setFeedback(payload.error ?? content.errorSend);
        return;
      }

      setStatus("success");
      setFeedback(payload.message ?? content.successSend);
      setForm(initialState);
    } catch {
      setStatus("error");
      setFeedback(content.networkError);
    }
  }

  return (
    <section className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(18,18,18,0.45)] px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl border border-[var(--hairline)] bg-[var(--surface-high)] p-8 shadow-[0_24px_80px_rgba(18,18,18,0.18)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-[-0.02em]">{content.title}</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{content.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={content.closeAria}
            className="label-mono border border-[var(--hairline)] px-3 py-1 text-[var(--muted)] hover:text-foreground"
          >
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{content.labels.name}</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full border border-[var(--hairline)] bg-background px-3 py-2.5 outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{content.labels.email}</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="w-full border border-[var(--hairline)] bg-background px-3 py-2.5 outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{content.labels.company}</span>
            <input
              value={form.company}
              onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
              className="w-full border border-[var(--hairline)] bg-background px-3 py-2.5 outline-none focus:border-[var(--primary)]"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">{content.labels.message}</span>
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              className="w-full border border-[var(--hairline)] bg-background px-3 py-2.5 outline-none focus:border-[var(--primary)]"
            />
          </label>
          <button type="submit" disabled={status === "loading"} className="ink-button label-mono px-6 py-3 disabled:opacity-60">
            {status === "loading" ? content.sending : content.send}
          </button>
        </form>
        {feedback ? (
          <p className={`mt-4 text-sm ${status === "error" ? "text-red-700" : "text-emerald-700"}`}>{feedback}</p>
        ) : null}
      </div>
    </section>
  );
}
