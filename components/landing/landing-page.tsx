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

type ThemeMode = "light" | "dark" | "system";

export function LandingPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = window.localStorage.getItem("theme-mode");
    return savedTheme === "light" || savedTheme === "dark" || savedTheme === "system" ? savedTheme : "light";
  });
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const savedLocale = window.localStorage.getItem("site-locale");
    return savedLocale === "en" || savedLocale === "uk" ? savedLocale : "en";
  });

  useEffect(() => {
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
  }, [theme]);

  useEffect(() => {
    const meta = homeDocumentMeta[locale];
    document.documentElement.lang = locale === "uk" ? "uk" : "en";
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
    window.localStorage.setItem("site-locale", locale);
  }, [locale]);

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
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
