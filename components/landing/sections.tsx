"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Locale, translateContent } from "@/app/data/site-content";
import { LogoYg } from "@/components/landing/logo-yg";

type ContactActionProps = {
  onOpenContact: () => void;
  locale: Locale;
};

type ThemeMode = "light" | "dark" | "system";

type TopNavProps = ContactActionProps & {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onLocaleChange: (locale: Locale) => void;
};

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          node.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoYg className="h-8 w-auto shrink-0 text-[var(--primary)] md:h-9" />
      <span className="font-display text-base font-semibold tracking-[-0.02em] text-foreground md:text-lg">
        Yevgen Galamaga
      </span>
    </span>
  );
}

export function TopNav({ onOpenContact, locale, theme, onThemeChange, onLocaleChange }: TopNavProps) {
  const content = translateContent(locale);
  const navItems = [
    { href: "#services", label: content.copy.navItems[0] },
    { href: "#projects", label: content.copy.navItems[1] },
    { href: "#tech-stack", label: content.copy.navItems[2] },
    { href: "#edge", label: content.copy.navItems[3] },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-[var(--hairline)] bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 md:px-8">
        <a href="#top" className="shrink-0">
          <BrandMark />
        </a>
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="label-mono text-[var(--muted)] transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-[var(--hairline)] bg-[var(--surface-high)] p-0.5">
              <button
                type="button"
                onClick={() => onLocaleChange("en")}
                className={`label-mono px-2.5 py-1 ${
                  locale === "en" ? "bg-[var(--primary)] text-[var(--surface-high)]" : "text-[var(--muted)]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLocaleChange("uk")}
                className={`label-mono px-2.5 py-1 ${
                  locale === "uk" ? "bg-[var(--primary)] text-[var(--surface-high)]" : "text-[var(--muted)]"
                }`}
              >
                UA
              </button>
            </div>
            <select
              value={theme}
              onChange={(event) => onThemeChange(event.target.value as ThemeMode)}
              aria-label="Theme switcher"
              className="label-mono appearance-none border border-[var(--hairline)] bg-[var(--surface-high)] px-2 py-1.5 text-[var(--muted)] outline-none"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
        <button type="button" onClick={onOpenContact} className="ink-button label-mono px-5 py-2.5">
          {content.copy.hireMe}
        </button>
      </div>
    </nav>
  );
}

export function HeroSection({ onOpenContact, locale }: ContactActionProps) {
  const content = translateContent(locale);
  const accent = locale === "uk" ? "автоматизації" : "replace manual work";

  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden pb-20 pt-32 md:items-center md:pb-24">
      <div className="absolute inset-0">
        <Image
          src="/hero-atmosphere.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-media object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,var(--scrim)_0%,var(--scrim)_42%,transparent_78%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      </div>
      <div className="hero-copy relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8">
        <p className="font-display mb-6 text-4xl font-semibold tracking-[-0.03em] text-foreground md:text-5xl lg:text-6xl">
          Yevgen Galamaga
        </p>
        <h1 className="font-display mb-6 max-w-3xl text-2xl font-medium leading-[1.2] tracking-[-0.02em] text-foreground md:text-4xl lg:text-[2.75rem]">
          {content.hero.title.split(accent)[0]}
          <span className="text-[var(--primary)]">{accent}</span>
          {content.hero.title.split(accent)[1]}
        </h1>
        <p className="mb-10 max-w-xl text-base leading-relaxed text-[var(--muted)] md:text-lg">
          {content.hero.description}
        </p>
        <button type="button" onClick={onOpenContact} className="ink-button label-mono inline-flex items-center gap-3 px-8 py-4">
          <span>{content.hero.cta}</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}

export function ProofSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal tonal-section border-y border-[var(--hairline)] px-6 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 max-w-2xl">
          <span className="label-mono mb-3 block text-[var(--muted)]">{content.copy.impactMetrics}</span>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] md:text-4xl">{content.copy.proofTitle}</h2>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {content.metrics.map((metric, index) => (
            <div key={metric.id} className="border-t border-[var(--hairline)] pt-6">
              <p className="label-mono mb-4 text-[var(--muted)]">
                {(index + 1).toString().padStart(2, "0")}
              </p>
              <p className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">{metric.detail}</p>
              <p className="label-mono mt-4 text-[var(--muted)]">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  const ref = useReveal<HTMLElement>();

  return (
    <section id="services" ref={ref} className="reveal px-6 py-28 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <span className="label-mono mb-3 block text-[var(--muted)]">{content.copy.capabilities}</span>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] md:text-4xl">{content.copy.whatIDo}</h2>
        </div>
        <div className="grid gap-12 md:grid-cols-3 md:gap-10">
          {content.services.map((service, index) => (
            <article key={service.id} className="border-t border-[var(--hairline)] pt-8">
              <p className="label-mono mb-6 text-[var(--muted)]">
                {(index + 1).toString().padStart(2, "0")}
              </p>
              <h3 className="font-display text-xl font-semibold tracking-[-0.02em]">{service.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] md:text-base">{service.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span key={tag} className="label-mono border border-[var(--hairline)] px-2.5 py-1 text-[var(--muted)]">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PhilosophySection() {
  const philosophyQuote =
    "\"If a task repeats twice, it should be automated. My philosophy is rooted in building systems that aren't just efficient, but autonomous - freeing human intellect for the work that truly matters.\"";
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal tonal-section border-y border-[var(--hairline)] px-6 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[240px_1fr] md:items-center md:gap-16">
        <div className="relative mx-auto aspect-[3/4] w-48 overflow-hidden md:mx-0 md:w-full">
          <Image
            src="/profile-portrait.jpg"
            alt="Yevgen Galamaga"
            fill
            sizes="240px"
            priority
            className="object-cover"
          />
        </div>
        <div>
          <p className="label-mono text-[var(--muted)]">Philosophy</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.02em] md:text-4xl">Yevgen Galamaga</h2>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">{philosophyQuote}</p>
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  const ref = useReveal<HTMLElement>();

  return (
    <section id="projects" ref={ref} className="reveal px-6 py-28 md:px-8">
      <div className="mx-auto max-w-7xl space-y-20">
        <div className="max-w-2xl">
          <span className="label-mono mb-3 block text-[var(--muted)]">{content.copy.caseStudies}</span>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            {content.copy.signatureProjects}
          </h2>
        </div>
        {content.projects.map((project, index) => (
          <article
            key={project.id}
            className="grid gap-10 border-t border-[var(--hairline)] pt-12 lg:grid-cols-2 lg:items-center lg:gap-16"
          >
            <div className={`space-y-6 ${index % 2 ? "lg:order-2" : ""}`}>
              <p className="label-mono text-[var(--muted)]">{(index + 1).toString().padStart(2, "0")}</p>
              <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] md:text-3xl">{project.title}</h3>
              <p className="text-[var(--muted)]">{project.description}</p>
              <ul className="space-y-3 text-sm text-[var(--muted)]">
                {project.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className="mt-1 text-foreground" aria-hidden="true">
                      —
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-10 border-t border-[var(--hairline)] pt-5">
                {project.stats.map((item) => (
                  <div key={item.label}>
                    <p className="font-display text-2xl font-semibold tracking-[-0.02em]">{item.value}</p>
                    <p className="label-mono mt-1 text-[var(--muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`relative aspect-[4/3] overflow-hidden bg-[var(--surface-low)] ${index % 2 ? "lg:order-1" : ""}`}>
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out hover:scale-[1.03]"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EdgeSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  const ref = useReveal<HTMLElement>();
  const edgeItems = [
    {
      id: "01",
      title: locale === "uk" ? "Workflow-first підхід" : "Workflow-First Design",
      quote:
        locale === "uk"
          ? "Я не просто створюю застосунки - я автоматизую цілі робочі процеси"
          : "I don't just build apps - I automate entire workflows",
    },
    {
      id: "02",
      title: locale === "uk" ? "Розробка, орієнтована на ROI" : "ROI-Driven Dev",
      quote: locale === "uk" ? "Фокус на окупності, а не просто на коді" : "I focus on ROI, not just code",
    },
    {
      id: "03",
      title: locale === "uk" ? "Гібридна експертиза" : "Hybrid Expertise",
      quote:
        locale === "uk"
          ? "Поєдную AI + backend + автоматизацію в одній системі"
          : "I combine AI + backend + automation in one system",
    },
    {
      id: "04",
      title: locale === "uk" ? "Архітектурна логіка" : "Architectural Logic",
      quote: locale === "uk" ? "Мислю системами, а не окремими фічами" : "I think in systems, not features",
    },
  ];

  return (
    <section id="edge" ref={ref} className="reveal tonal-section border-y border-[var(--hairline)] px-6 py-28 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <span className="label-mono mb-3 block text-[var(--muted)]">{content.copy.edgeLabel}</span>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] md:text-4xl">{content.copy.edgeTitle}</h2>
        </div>
        <div className="grid gap-12 md:grid-cols-2">
          {edgeItems.map((item) => (
            <article key={item.id} className="border-t border-[var(--hairline)] pt-8">
              <span className="label-mono text-[var(--muted)]">{item.id}</span>
              <h4 className="font-display mt-4 text-xl font-semibold tracking-[-0.02em]">{item.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] md:text-base">&quot;{item.quote}&quot;</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

type StackColumnProps = {
  title: string;
  values: string[];
};

function StackColumn({ title, values }: StackColumnProps) {
  return (
    <article className="border-t border-[var(--hairline)] pt-8">
      <h3 className="label-mono mb-6 text-[var(--muted)]">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="border border-[var(--hairline)] bg-[var(--surface-high)] px-3 py-1.5 text-xs text-[var(--muted)]"
          >
            {value}
          </span>
        ))}
      </div>
    </article>
  );
}

export function StackSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  const ref = useReveal<HTMLElement>();

  return (
    <section id="tech-stack" ref={ref} className="reveal px-6 py-28 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <span className="label-mono mb-3 block text-[var(--muted)]">{content.copy.tooling}</span>
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] md:text-4xl">{content.copy.stackTitle}</h2>
        </div>
        <div className="grid gap-10 md:grid-cols-3">
          <StackColumn title="Automation & AI" values={content.stack.automation} />
          <StackColumn title="Frontend" values={content.stack.frontend} />
          <StackColumn title="Backend" values={content.stack.backend} />
        </div>
      </div>
    </section>
  );
}

export function CtaBanner({ onOpenContact, locale }: ContactActionProps) {
  const content = translateContent(locale);
  const ref = useReveal<HTMLElement>();

  return (
    <section ref={ref} className="reveal tonal-section border-t border-[var(--hairline)] px-6 py-28 text-center md:px-8">
      <p className="label-mono mb-6 text-[var(--muted)]">{content.copy.ctaQuote}</p>
      <h2 className="font-display mx-auto mb-10 max-w-3xl text-3xl font-semibold tracking-[-0.02em] md:text-5xl">
        {content.copy.ctaTitle}
      </h2>
      <button type="button" onClick={onOpenContact} className="ink-button label-mono inline-flex items-center gap-3 px-10 py-4">
        <span>{content.hero.cta}</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  return (
    <footer className="border-t border-[var(--hairline)] bg-background px-6 py-16 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <BrandMark />
          <p className="label-mono text-[var(--muted)]">{content.copy.footerTagline}</p>
        </div>
        <div className="flex flex-wrap gap-8">
          <a
            href="https://www.linkedin.com/in/yevgengalamaga/"
            target="_blank"
            rel="noreferrer"
            className="label-mono text-[var(--muted)] transition-colors hover:text-foreground"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/EvgeniyGal"
            target="_blank"
            rel="noreferrer"
            className="label-mono text-[var(--muted)] transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://t.me/yevgengalamaga"
            target="_blank"
            rel="noreferrer"
            className="label-mono text-[var(--muted)] transition-colors hover:text-foreground"
          >
            Telegram
          </a>
          <a href="mailto:evgeniygal@gmail.com" className="label-mono text-[var(--muted)] transition-colors hover:text-foreground">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
