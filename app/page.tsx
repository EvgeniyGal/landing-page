"use client";

import { useEffect, useState } from "react";
import { Locale } from "@/app/data/site-content";
import { ContactForm } from "@/components/landing/contact-form";
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

type ThemeMode = "light" | "dark" | "system";

export default function Home() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const savedTheme = window.localStorage.getItem("theme-mode");
    return savedTheme === "light" || savedTheme === "dark" || savedTheme === "system" ? savedTheme : "dark";
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
    document.documentElement.lang = locale === "uk" ? "uk" : "en";
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
        <ContactForm locale={locale} isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
