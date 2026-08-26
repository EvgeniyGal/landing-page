"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Locale } from "@/app/data/site-content";
import {
  CtaBanner,
  EdgeSection,
  HeroSection,
  PhilosophySection,
  ProjectsSection,
  ProofSection,
  ServicesSection,
  SiteFooter,
  StackSection,
  TopNav,
} from "@/components/landing/sections";
import { homeDocumentMeta } from "@/lib/seo";

const ContactForm = dynamic(
  () => import("@/components/landing/contact-form").then((mod) => mod.ContactForm),
  { ssr: false },
);

const OfferAgreementModal = dynamic(
  () => import("@/components/landing/offer-agreement").then((mod) => mod.OfferAgreementModal),
  { ssr: false },
);

type ThemeMode = "light" | "dark" | "system";

export function LandingPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [locale, setLocale] = useState<Locale>("en");
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme-mode");
    const savedLocale = window.localStorage.getItem("site-locale");

    if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
      setTheme(savedTheme);
    }

    if (savedLocale === "en" || savedLocale === "uk") {
      setLocale(savedLocale);
    }

    setPrefsReady(true);
  }, []);

  useEffect(() => {
    if (!prefsReady) {
      return;
    }

    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      const resolvedDark = theme === "system" ? media.matches : theme === "dark";
      root.classList.toggle("dark", resolvedDark);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    window.localStorage.setItem("theme-mode", theme);

    return () => media.removeEventListener("change", applyTheme);
  }, [theme, prefsReady]);

  useEffect(() => {
    if (!prefsReady) {
      return;
    }

    const meta = homeDocumentMeta[locale];
    document.documentElement.lang = locale === "uk" ? "uk" : "en";
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
    window.localStorage.setItem("site-locale", locale);
  }, [locale, prefsReady]);

  return (
    <>
      <TopNav
        locale={locale}
        theme={theme}
        onThemeChange={setTheme}
        onLocaleChange={setLocale}
        onOpenContact={() => setIsContactOpen(true)}
      />
      <main>
        <HeroSection locale={locale} onOpenContact={() => setIsContactOpen(true)} />
        <ProofSection locale={locale} />
        <ServicesSection locale={locale} />
        <PhilosophySection />
        <ProjectsSection locale={locale} />
        <EdgeSection locale={locale} />
        <StackSection locale={locale} />
        <CtaBanner locale={locale} onOpenContact={() => setIsContactOpen(true)} />
        {isContactOpen ? (
          <ContactForm locale={locale} isOpen onClose={() => setIsContactOpen(false)} />
        ) : null}
        {isOfferOpen ? (
          <OfferAgreementModal locale={locale} isOpen onClose={() => setIsOfferOpen(false)} />
        ) : null}
      </main>
      <SiteFooter locale={locale} onOpenOffer={() => setIsOfferOpen(true)} />
    </>
  );
}
