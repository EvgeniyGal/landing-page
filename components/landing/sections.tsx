import Image from "next/image";
import { Locale, translateContent } from "@/app/data/site-content";

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

export function TopNav({ onOpenContact, locale, theme, onThemeChange, onLocaleChange }: TopNavProps) {
  const content = translateContent(locale);
  const navItems = [
    { href: "#services", label: content.copy.navItems[0] },
    { href: "#projects", label: content.copy.navItems[1] },
    { href: "#tech-stack", label: content.copy.navItems[2] },
    { href: "#edge", label: content.copy.navItems[3] },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4">
        <p className="font-mono text-lg font-black tracking-tighter text-slate-100">YEVGEN_GALAMAGA</p>
        <div className="hidden items-center gap-4 md:flex">
          {navItems.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 transition-colors hover:text-[var(--primary)]"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-1 rounded border border-white/20 bg-[var(--surface-low)] p-1">
            <button
              type="button"
              onClick={() => onLocaleChange("en")}
              className={`rounded px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                locale === "en" ? "bg-[var(--primary)] text-slate-900" : "text-[var(--muted)]"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("uk")}
              className={`rounded px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                locale === "uk" ? "bg-[var(--primary)] text-slate-900" : "text-[var(--muted)]"
              }`}
            >
              UA
            </button>
          </div>
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as ThemeMode)}
            aria-label="Theme switcher"
            className="w-9 appearance-none rounded border border-white/20 bg-[var(--surface-low)] px-0 py-1 text-center font-mono text-sm font-bold text-[var(--muted)] outline-none [-moz-appearance:textfield] [&::-ms-expand]:hidden"
          >
            <option value="light">☀</option>
            <option value="dark">☾</option>
            <option value="system">🖥</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onOpenContact}
          className="rounded bg-[var(--primary)] px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-900 transition-all hover:bg-white"
        >
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
    <section className="section-shell relative flex min-h-[870px] items-center overflow-hidden pb-20 pt-32">
      <div className="pointer-events-none absolute left-[-120px] top-1/3 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-10 right-[-120px] h-72 w-72 rounded-full bg-[var(--tertiary)]/10 blur-[120px]" />
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <span className="mb-10 inline-flex items-center gap-3 rounded-full border border-white/20 bg-[var(--surface-high)] px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[var(--tertiary)] animate-pulse" aria-hidden="true" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
            {content.hero.badge}
          </span>
        </span>
        <h1 className="mb-8 text-4xl font-black tracking-tight leading-[1.1] md:text-6xl lg:text-7xl">
          {content.hero.title.split(accent)[0]}
          <span className="gradient-text">{accent}</span>
          {content.hero.title.split(accent)[1]}
        </h1>
        <p className="mb-12 max-w-3xl text-lg leading-relaxed text-[var(--muted)] md:text-xl">{content.hero.description}</p>
        <button
          type="button"
          onClick={onOpenContact}
          className="group mt-10 inline-flex items-center justify-center gap-3 rounded-md bg-[var(--primary)] px-8 py-4 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900 transition-all hover:shadow-[0_0_30px_rgba(152,203,255,0.3)]"
        >
          <span>{content.hero.cta}</span>
          <span aria-hidden="true" className="text-sm transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </section>
  );
}

export function ProofSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  const valueColors = ["text-[var(--primary)]", "text-[var(--secondary)]", "text-[var(--tertiary)]", "text-white"];

  return (
    <section className="overflow-hidden border-y border-white/10 bg-[var(--surface-low)] px-6 py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
            {content.copy.impactMetrics}
          </span>
          <h2 className="text-3xl font-bold tracking-tight">{content.copy.proofTitle}</h2>
        </div>
        <div className="border-l border-white/30 pl-8 font-mono text-sm">
          {content.metrics.map((metric, index) => (
            <div
              key={metric.id}
              className={`flex flex-col gap-4 border-dashed border-white/20 py-8 md:flex-row md:items-end md:justify-between ${
                index < content.metrics.length - 1 ? "border-b" : ""
              }`}
            >
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                {`${(index + 1).toString().padStart(2, "0")} // ${metric.label.toLowerCase().replaceAll(" ", "_")}`}
              </span>
              <div className="flex items-baseline gap-3">
                <span className={`text-4xl font-bold ${valueColors[index] ?? "text-white"}`}>{metric.value}</span>
                <span className="font-mono text-xs italic lowercase text-[var(--muted)]">{metric.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicesSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  return (
    <section id="services" className="bg-[var(--background)] px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            {content.copy.capabilities}
          </span>
          <h2 className="text-4xl font-bold tracking-tight">{content.copy.whatIDo}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.services.map((service, index) => (
            <article
              key={service.id}
              className="group glass-card rounded-xl p-10 transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-[0_0_30px_rgba(152,203,255,0.12)]"
            >
              <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] opacity-60">
                FUNC_{(index + 1).toString().padStart(2, "0")}
              </p>
              <h3 className="text-xl font-bold">{service.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{service.description}</p>
              <div className="mt-6 flex flex-wrap gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-[var(--surface-high)] px-2 py-1 text-[10px] font-mono font-semibold uppercase text-[var(--primary)]"
                  >
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

  return (
    <section className="border-y border-white/10 bg-[var(--surface-low)] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-start gap-8 py-10 md:flex-row md:items-center md:gap-10">
          <div className="group relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--tertiary)] blur-2xl opacity-30 transition-opacity group-hover:opacity-50" />
            <div className="relative h-44 w-32 overflow-hidden rounded-2xl border border-white/15 bg-[var(--surface-low)] p-1 shadow-[0_20px_40px_rgba(6,14,32,0.65)] transition-transform duration-300 group-hover:-translate-y-0.5">
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <Image
                  src="/profile-photo.jpg"
                  alt="Yevgen Galamaga"
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-[var(--surface-low)] bg-[var(--primary)] text-[11px] font-bold text-slate-900 shadow-[0_0_20px_rgba(152,203,255,0.35)] transition-shadow group-hover:shadow-[0_0_28px_rgba(152,203,255,0.55)]">
              ✓
            </div>
            <p className="absolute -bottom-1 right-2 font-mono text-[10px] font-bold lowercase text-[var(--primary)]">
              verified
            </p>
          </div>
          <div className="hidden h-48 border-l border-dashed border-white/20 md:block" />
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
              Architect_Identity
            </p>
            <h2 className="mt-2 text-5xl leading-none text-[var(--foreground)]" style={{ fontFamily: "cursive" }}>
              Yevgen Galamaga
            </h2>
            <p className="text-[clamp(1.6rem,2.2vw,2.15rem)] italic leading-[1.45] tracking-[-0.01em] text-[var(--muted)]">
              {philosophyQuote}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  const accentByIndex = ["text-[var(--primary)]", "text-[var(--secondary)]", "text-[var(--tertiary)]"];

  return (
    <section id="projects" className="bg-[var(--surface-low)] px-6 py-24">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="mb-16">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
            {content.copy.caseStudies}
          </span>
          <h2 className="text-4xl font-bold tracking-tight">{content.copy.signatureProjects}</h2>
        </div>
        {content.projects.map((project, index) => (
          <article key={project.id} className="grid gap-12 py-6 lg:grid-cols-2 lg:items-start">
            <div className={`space-y-6 ${index % 2 ? "lg:order-2" : ""}`}>
              <h3 className="text-2xl font-bold">
                <span className="mr-3">{project.emoji}</span>
                {project.title}
              </h3>
              <p className="text-[var(--muted)]">{project.description}</p>
              <ul className="space-y-2 font-mono text-sm text-[var(--muted)]">
                {project.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3">
                    <span className={`font-bold ${accentByIndex[index] ?? "text-[var(--primary)]"}`}>→</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-8 border-t border-white/15 pt-4">
                {project.stats.map((item) => (
                  <div key={item.label}>
                    <p className={`font-mono text-2xl font-bold ${accentByIndex[index] ?? "text-[var(--primary)]"}`}>
                      {item.value}
                    </p>
                    <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              className={`glass-card relative flex aspect-video items-center justify-center overflow-hidden rounded-xl opacity-70 grayscale transition-all duration-500 hover:opacity-95 hover:grayscale-0 ${
                index % 2 ? "lg:order-1" : ""
              }`}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function EdgeSection({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  const edgeItems = [
    {
      id: "01",
      title: locale === "uk" ? "Workflow-first підхід" : "Workflow-First Design",
      quote:
        locale === "uk"
          ? "Я не просто створюю застосунки - я автоматизую цілі робочі процеси"
          : "I don't just build apps - I automate entire workflows",
      color: "text-[var(--primary)]",
    },
    {
      id: "02",
      title: locale === "uk" ? "Розробка, орієнтована на ROI" : "ROI-Driven Dev",
      quote: locale === "uk" ? "Фокус на окупності, а не просто на коді" : "I focus on ROI, not just code",
      color: "text-[var(--secondary)]",
    },
    {
      id: "03",
      title: locale === "uk" ? "Гібридна експертиза" : "Hybrid Expertise",
      quote:
        locale === "uk"
          ? "Поєдную AI + backend + автоматизацію в одній системі"
          : "I combine AI + backend + automation in one system",
      color: "text-[var(--tertiary)]",
    },
    {
      id: "04",
      title: locale === "uk" ? "Архітектурна логіка" : "Architectural Logic",
      quote: locale === "uk" ? "Мислю системами, а не окремими фічами" : "I think in systems, not features",
      color: "text-[var(--muted)]",
    },
  ];

  return (
    <section id="edge" className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            {content.copy.edgeLabel}
          </span>
          <h2 className="text-4xl font-bold tracking-tight">{content.copy.edgeTitle}</h2>
        </div>
        <div className="grid gap-10 md:grid-cols-2">
          {edgeItems.map((item) => (
            <article key={item.id} className="flex gap-6">
              <span className={`font-mono text-sm font-bold ${item.color}`}>{item.id}</span>
              <div>
                <h4 className="mb-2 font-bold">{item.title}</h4>
                <p className="text-sm leading-relaxed text-[var(--muted)]">&quot;{item.quote}&quot;</p>
              </div>
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
  color: string;
};

function StackColumn({ title, values, color }: StackColumnProps) {
  return (
    <article className="glass-card rounded-xl p-8">
      <h3 className="mb-6 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color }}>
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            key={value}
            className="rounded border border-white/15 bg-[var(--surface-low)] px-3 py-1 text-[10px] font-mono font-bold uppercase text-[var(--muted)] transition-colors"
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
  return (
    <section id="tech-stack" className="bg-[var(--surface-low)] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--secondary)]">
            {content.copy.tooling}
          </span>
          <h2 className="text-4xl font-bold tracking-tight">{content.copy.stackTitle}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <StackColumn title="AUTOMATION_AI" values={content.stack.automation} color="var(--secondary)" />
          <StackColumn title="FRONTEND_CORE" values={content.stack.frontend} color="var(--primary)" />
          <StackColumn title="BACKEND_SYSTEM" values={content.stack.backend} color="var(--tertiary)" />
        </div>
      </div>
    </section>
  );
}

export function CtaBanner({ onOpenContact, locale }: ContactActionProps) {
  const content = translateContent(locale);
  return (
    <section className="bg-[var(--surface-low)] px-6 py-28 text-center">
      <p className="mb-8 font-mono text-sm font-bold uppercase italic tracking-tight text-[var(--primary)] opacity-80">
        {content.copy.ctaQuote}
      </p>
      <h2 className="mx-auto mb-12 mt-4 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">
        {content.copy.ctaTitle}
      </h2>
      <button
        type="button"
        onClick={onOpenContact}
        className="group inline-flex items-center gap-4 rounded-md bg-[var(--primary)] px-10 py-5 text-lg font-bold uppercase tracking-[0.12em] text-slate-900 transition-all hover:shadow-[0_0_40px_rgba(152,203,255,0.4)]"
      >
        <span>{content.hero.cta}</span>
        <span aria-hidden="true" className="text-xl transition-transform group-hover:scale-110">
          ⚡
        </span>
      </button>
    </section>
  );
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const content = translateContent(locale);
  return (
    <footer className="border-t border-white/10 bg-[var(--surface-low)] px-8 py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <p className="font-mono text-xl font-bold tracking-tight text-[var(--foreground)]">YEVGEN_GALAMAGA</p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
            {content.copy.footerTagline}
          </p>
        </div>
        <div className="flex flex-wrap gap-8">
          <a
            href="https://www.linkedin.com/in/yevgengalamaga/"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
          >
            LinkedIn
          </a>
          <a
            href="https://github.com/EvgeniyGal"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
          >
            GitHub
          </a>
          <a
            href="https://t.me/yevgengalamaga"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
          >
            Telegram
          </a>
          <a
            href="mailto:evgeniygal@gmail.com"
            className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
