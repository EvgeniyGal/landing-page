"use client";

import { useEffect } from "react";
import { getOfferAgreement } from "@/app/data/offer-agreement";
import { Locale } from "@/app/data/site-content";

type OfferAgreementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  locale: Locale;
};

export function OfferAgreementModal({ isOpen, onClose, locale }: OfferAgreementModalProps) {
  const content = getOfferAgreement(locale);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="offer-agreement-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(18,18,18,0.45)] px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col border border-[var(--hairline)] bg-[var(--surface-high)] shadow-[0_24px_80px_rgba(18,18,18,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--hairline)] p-6 md:p-8">
          <div>
            <h3 id="offer-agreement-title" className="font-display text-2xl font-semibold tracking-[-0.02em]">
              {content.title}
            </h3>
            <p className="label-mono mt-2 text-[var(--muted)]">{content.updated}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={content.closeAria}
            className="label-mono border border-[var(--hairline)] px-3 py-1 text-[var(--muted)] hover:text-foreground"
          >
            {content.close}
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6 md:px-8 md:py-8">
          <div className="space-y-8">
            {content.sections.map((section) => (
              <article key={section.heading}>
                <h4 className="font-display text-lg font-semibold tracking-[-0.02em]">{section.heading}</h4>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
