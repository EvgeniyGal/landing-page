export type Locale = "en" | "uk";

type LocalizedText = {
  en: string;
  uk: string;
};

const t = (text: LocalizedText, locale: Locale) => text[locale];

export type Metric = {
  id: string;
  label: LocalizedText;
  value: LocalizedText;
  detail: LocalizedText;
};

export type Service = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  tags: LocalizedText[];
};

export type Project = {
  id: string;
  emoji: LocalizedText;
  title: LocalizedText;
  image: string;
  description: LocalizedText;
  highlights: LocalizedText[];
  stats: { label: LocalizedText; value: LocalizedText }[];
};

export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#tech-stack", label: "Stack" },
  { href: "#edge", label: "Edge" },
];

export const hero = {
  badge: {
    en: "System Architect // Automation Expert",
    uk: "Системний архітектор // Експерт з автоматизації",
  },
  title: {
    en: "I build AI-powered automation systems that replace manual work and scale operations that save teams 10–20 hours/week.",
    uk: "Я створюю AI-системи автоматизації, що замінюють ручну роботу та масштабують операції, економлячи командам 10-20 годин щотижня.",
  },
  description: {
    en: "I design automation-first products that combine full-stack engineering, AI, and n8n to eliminate repetitive tasks, connect business tools, and turn operations into predictable systems.",
    uk: "Проєктую продукти, де автоматизація на першому місці: поєдную full-stack розробку, AI та n8n, щоб прибрати рутину, об'єднати бізнес-інструменти й зробити процеси прогнозованими.",
  },
  cta: {
    en: "Tell me what you want to eliminate — I'll build the system",
    uk: "Опишіть, що хочете прибрати з процесу — я збудую систему",
  },
};

export const metrics: Metric[] = [
  {
    id: "efficiency",
    label: { en: "Efficiency Gain", uk: "Зростання ефективності" },
    value: { en: "75%", uk: "75%" },
    detail: { en: "Reduced manual work", uk: "Менше ручної роботи" },
  },
  {
    id: "throughput",
    label: { en: "Data Throughput", uk: "Пропускна здатність даних" },
    value: { en: "10,000+", uk: "10 000+" },
    detail: { en: "Records processing automated", uk: "Автоматизована обробка записів" },
  },
  {
    id: "capacity",
    label: { en: "Capacity Unlock", uk: "Вивільнений ресурс команди" },
    value: { en: "15+ hrs", uk: "15+ год" },
    detail: { en: "Saved per week for teams", uk: "Економія щотижня для команд" },
  },
  {
    id: "scope",
    label: { en: "System Scope", uk: "Рівень охоплення" },
    value: { en: "End-to-End", uk: "End-to-End" },
    detail: { en: "Built end-to-end systems", uk: "Повноцінні системи під ключ" },
  },
];

export const services: Service[] = [
  {
    id: "workflows",
    title: { en: "Build AI-powered workflows", uk: "AI-автоматизація бізнес-процесів" },
    description: {
      en: "Use n8n, APIs, and LLMs to build reliable automations that react to events and complete tasks without manual handoffs.",
      uk: "Використовую n8n, API та LLM, щоб будувати надійні автоматизації, які реагують на події та доводять задачі до результату без ручних передач.",
    },
    tags: [
      { en: "n8n", uk: "n8n" },
      { en: "OpenAI", uk: "OpenAI" },
      { en: "Claude", uk: "Claude" },
      { en: "Webhooks", uk: "Вебхуки" },
      { en: "Automation", uk: "Автоматизація" },
    ],
  },
  {
    id: "fullstack",
    title: { en: "Develop custom full-stack systems", uk: "Кастомні full-stack платформи" },
    description: {
      en: "Create robust products on Next.js and modern backends with clean architecture, role-based access, and scalable databases.",
      uk: "Створюю надійні продукти на Next.js і сучасних бекендах з чистою архітектурою, доступами за ролями та масштабованими базами даних.",
    },
    tags: [
      { en: "Next.js", uk: "Next.js" },
      { en: "React", uk: "React" },
      { en: "TypeScript", uk: "TypeScript" },
      { en: "Node.js", uk: "Node.js" },
      { en: "Drizzle", uk: "Drizzle" },
      { en: "PostgreSQL", uk: "PostgreSQL" },
    ],
  },
  {
    id: "integrations",
    title: { en: "Integrate third-party tools", uk: "Інтеграція CRM, платіжок і сервісів" },
    description: {
      en: "Connect CRM, payment gateways, analytics, and legacy tools into one consistent operating flow.",
      uk: "Інтегрую CRM, платіжні системи, аналітику та легасі-інструменти в єдиний робочий контур.",
    },
    tags: [
      { en: "REST API", uk: "REST API" },
      { en: "Webhooks", uk: "Вебхуки" },
      { en: "CRM", uk: "CRM" },
      { en: "Payments", uk: "Платежі" },
      { en: "Social APIs", uk: "Social APIs" },
      { en: "Legacy Systems", uk: "Легасі-системи" },
    ],
  },
];

export const projects: Project[] = [
  {
    id: "school",
    emoji: { en: "🏫", uk: "🏫" },
    title: { en: "School Management System", uk: "Система управління школою" },
    image: "/school-management-system.webp",
    description: {
      en: "A full-stack platform that unified scheduling, attendance, operations, and financial workflows into one controlled environment.",
      uk: "Full-stack платформа, що об'єднала розклад, відвідуваність, операційні та фінансові процеси в єдине кероване середовище.",
    },
    highlights: [
      {
        en: "Automated scheduling, attendance, and curriculum tracking",
        uk: "Автоматизований розклад, відвідуваність і контроль навчальних програм",
      },
      { en: "Teacher coordination and salary processing", uk: "Координація викладачів і нарахування виплат" },
      { en: "End-to-end financial reporting", uk: "Наскрізна фінансова звітність" },
    ],
    stats: [
      { label: { en: "WORKLOAD_RED", uk: "WORKLOAD_RED" }, value: { en: "~70%", uk: "~70%" } },
      { label: { en: "CONSOLIDATION", uk: "CONSOLIDATION" }, value: { en: "100%", uk: "100%" } },
    ],
  },
  {
    id: "docs",
    emoji: { en: "📄", uk: "📄" },
    title: { en: "Document Lifecycle System", uk: "Система життєвого циклу документів" },
    image: "/document-life-cycle.webp",
    description: {
      en: "A digital workflow for generating, approving, signing, and archiving documents with transparent status at every stage.",
      uk: "Цифровий контур для створення, погодження, підпису та архівації документів із прозорим статусом на кожному етапі.",
    },
    highlights: [
      { en: "Automated contracts and invoice generation", uk: "Автоматичне формування договорів та рахунків" },
      { en: "Real-time approval and signature tracking", uk: "Відстеження погодження й підписання в реальному часі" },
      { en: "Structured secure cloud archiving", uk: "Структурований безпечний хмарний архів" },
    ],
    stats: [
      { label: { en: "MANUAL_HANDLING", uk: "MANUAL_HANDLING" }, value: { en: "0 MS", uk: "0 MS" } },
      { label: { en: "STATUS_VIS", uk: "STATUS_VIS" }, value: { en: "LIVE", uk: "LIVE" } },
    ],
  },
  {
    id: "content",
    emoji: { en: "🤖", uk: "🤖" },
    title: { en: "AI Content Pipeline", uk: "AI-контент конвеєр" },
    image: "/ai-content-pipeline.webp",
    description: {
      en: "An automation pipeline with n8n and APIs for high-volume content production, formatting, and publishing across channels.",
      uk: "Автоматизований конвеєр на n8n та API для масштабного створення, форматування й публікації контенту в різних каналах.",
    },
    highlights: [
      { en: "Automated text and caption formatting", uk: "Автоматичне форматування текстів і підписів" },
      { en: "Multi-platform distribution engine", uk: "Дистрибуція на кілька платформ з одного потоку" },
      { en: "Analytics tracking and performance feedback", uk: "Трекінг аналітики та цикл покращення результатів" },
    ],
    stats: [
      { label: { en: "OUTPUT_SCALE", uk: "OUTPUT_SCALE" }, value: { en: "10X", uk: "10X" } },
      { label: { en: "MKT_WORKLOAD", uk: "MKT_WORKLOAD" }, value: { en: "MIN", uk: "MIN" } },
    ],
  },
];

export const edgePoints = [
  "I don't just build apps - I automate entire workflows",
  "I focus on ROI, not just code",
  "I combine AI + backend + automation in one system",
  "I think in systems, not features",
];

export const stack = {
  automation: ["n8n", "OpenAI", "Claude", "APIs", "Webhooks"],
  frontend: [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "shadcn/ui",
    "TanStack",
  ],
  backend: ["Node.js", "PostgreSQL", "Drizzle", "Neon", "Vercel"],
};

export const copy = {
  navItems: {
    en: ["01. Services", "02. Projects", "03. Stack", "04. Edge"],
    uk: ["01. Послуги", "02. Проєкти", "03. Стек", "04. Перевага"],
  },
  hireMe: {
    en: "[ Hire_Me ]",
    uk: "[ Обговорити_проєкт ]",
  },
  impactMetrics: {
    en: "[ impact_metrics ]",
    uk: "[ impact_metrics ]",
  },
  proofTitle: {
    en: "Proof of Performance",
    uk: "Підтверджені результати",
  },
  capabilities: {
    en: "Capabilities",
    uk: "Можливості",
  },
  whatIDo: {
    en: "What I Do",
    uk: "Що я роблю",
  },
  caseStudies: {
    en: "Case Studies",
    uk: "Кейси",
  },
  signatureProjects: {
    en: "Signature Projects",
    uk: "Ключові проєкти",
  },
  edgeLabel: {
    en: "The Edge",
    uk: "Перевага",
  },
  edgeTitle: {
    en: "The Systems Thinking Advantage",
    uk: "Системне мислення як перевага",
  },
  tooling: {
    en: "Tooling",
    uk: "Інструменти",
  },
  stackTitle: {
    en: "The Tech Stack",
    uk: "Технологічний стек",
  },
  ctaQuote: {
    en: "\"IF_TASK_REPEATS == TRUE { AUTOMATE(); }\"",
    uk: "\"IF_TASK_REPEATS == TRUE { AUTOMATE(); }\"",
  },
  ctaTitle: {
    en: "Ready to reclaim your time?",
    uk: "Готові повернути собі час?",
  },
  footerTagline: {
    en: "© 2024 Kinetic Architect of Automation.",
    uk: "© 2024 Архітектор системної автоматизації.",
  },
  contact: {
    title: {
      en: "Tell me what you want to eliminate",
      uk: "Опишіть, що хочете прибрати з процесу",
    },
    subtitle: {
      en: "Share your process bottleneck and I will design the automation system.",
      uk: "Опишіть вузьке місце у вашому процесі - і я спроєктую систему автоматизації.",
    },
    closeAria: {
      en: "Close contact form",
      uk: "Закрити форму зв'язку",
    },
    labels: {
      name: { en: "Name", uk: "Ім'я" },
      email: { en: "Email", uk: "Email" },
      company: { en: "Company (optional)", uk: "Компанія (необов'язково)" },
      message: { en: "What should be automated?", uk: "Що саме потрібно автоматизувати?" },
    },
    send: { en: "Send inquiry", uk: "Надіслати запит" },
    sending: { en: "Sending...", uk: "Надсилання..." },
    errorSend: { en: "Could not send your message.", uk: "Не вдалося надіслати повідомлення." },
    successSend: { en: "Message sent successfully.", uk: "Повідомлення успішно надіслано." },
    networkError: { en: "Unexpected network error. Please try again.", uk: "Мережева помилка. Спробуйте ще раз." },
  },
};

export function translateContent(locale: Locale) {
  return {
    hero: {
      badge: t(hero.badge, locale),
      title: t(hero.title, locale),
      description: t(hero.description, locale),
      cta: t(hero.cta, locale),
    },
    metrics: metrics.map((metric) => ({
      id: metric.id,
      label: t(metric.label, locale),
      value: t(metric.value, locale),
      detail: t(metric.detail, locale),
    })),
    services: services.map((service) => ({
      id: service.id,
      title: t(service.title, locale),
      description: t(service.description, locale),
      tags: service.tags.map((tag) => t(tag, locale)),
    })),
    projects: projects.map((project) => ({
      id: project.id,
      emoji: t(project.emoji, locale),
      title: t(project.title, locale),
      image: project.image,
      description: t(project.description, locale),
      highlights: project.highlights.map((highlight) => t(highlight, locale)),
      stats: project.stats.map((item) => ({
        label: t(item.label, locale),
        value: t(item.value, locale),
      })),
    })),
    stack,
    copy: {
      navItems: copy.navItems[locale],
      hireMe: copy.hireMe[locale],
      impactMetrics: copy.impactMetrics[locale],
      proofTitle: copy.proofTitle[locale],
      capabilities: copy.capabilities[locale],
      whatIDo: copy.whatIDo[locale],
      caseStudies: copy.caseStudies[locale],
      signatureProjects: copy.signatureProjects[locale],
      edgeLabel: copy.edgeLabel[locale],
      edgeTitle: copy.edgeTitle[locale],
      tooling: copy.tooling[locale],
      stackTitle: copy.stackTitle[locale],
      ctaQuote: copy.ctaQuote[locale],
      ctaTitle: copy.ctaTitle[locale],
      footerTagline: copy.footerTagline[locale],
      contact: {
        title: copy.contact.title[locale],
        subtitle: copy.contact.subtitle[locale],
        closeAria: copy.contact.closeAria[locale],
        labels: {
          name: copy.contact.labels.name[locale],
          email: copy.contact.labels.email[locale],
          company: copy.contact.labels.company[locale],
          message: copy.contact.labels.message[locale],
        },
        send: copy.contact.send[locale],
        sending: copy.contact.sending[locale],
        errorSend: copy.contact.errorSend[locale],
        successSend: copy.contact.successSend[locale],
        networkError: copy.contact.networkError[locale],
      },
    },
  };
}
