import type { Metadata } from "next";

export const SITE_NAME = "Yevgen Galamaga";
export const SITE_TAGLINE = "AI-Powered Automation Architect";

export const SITE_DESCRIPTION =
  "I build AI-powered automation systems that replace manual work and scale operations, saving teams 10–20 hours a week with n8n, full-stack engineering, and LLMs.";

const DEFAULT_SITE_URL = "http://localhost:3000";

export const socialProfiles = [
  "https://www.linkedin.com/in/yevgengalamaga/",
  "https://github.com/EvgeniyGal",
  "https://t.me/yevgengalamaga",
] as const;

export const contactEmail = "evgeniygal@gmail.com";

export const pages = {
  home: {
    path: "/",
    title: "Yevgen Galamaga | AI Automation Architect — n8n, Full-Stack & LLM Workflows",
    description: SITE_DESCRIPTION,
    keywords: [
      "Yevgen Galamaga",
      "AI automation architect",
      "n8n automation",
      "workflow automation",
      "LLM workflows",
      "full-stack Next.js",
      "business process automation",
      "AI-powered systems",
      "OpenAI",
      "Claude",
      "автоматизація бізнес-процесів",
      "n8n Україна",
    ],
  },
  notFound: {
    path: "/404",
    title: "Page Not Found | Yevgen Galamaga",
    description:
      "This page does not exist. Return to Yevgen Galamaga's site to see AI automation systems, case studies, and how to start a project.",
    keywords: ["404", "page not found", "Yevgen Galamaga", "AI automation"],
  },
} as const;

export type PageKey = keyof typeof pages;

export const homeDocumentMeta = {
  en: {
    title: pages.home.title,
    description: pages.home.description,
  },
  uk: {
    title: "Yevgen Galamaga | Архітектор AI-автоматизації — n8n, full-stack і LLM-системи",
    description:
      "Я створюю AI-системи автоматизації, що замінюють ручну роботу та масштабують операції, економлячи командам 10–20 годин щотижня.",
  },
} as const;

function toSiteUrl(raw: string): URL {
  const url = new URL(raw);
  url.hash = "";
  url.search = "";
  if (url.pathname === "/" || url.pathname === "") {
    url.pathname = "";
  }
  return url;
}

export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return toSiteUrl(explicit);
  }

  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelHost) {
    return toSiteUrl(`https://${vercelHost}`);
  }

  return toSiteUrl(DEFAULT_SITE_URL);
}

export function buildPageMetadata(pageKey: PageKey): Metadata {
  const page = pages[pageKey];
  const canonical = new URL(page.path, getSiteUrl()).toString();

  return {
    title: { absolute: page.title },
    description: page.description,
    keywords: [...page.keywords],
    alternates: { canonical },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      type: "website",
      locale: "en_US",
      alternateLocale: ["uk_UA"],
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export function getHomeJsonLd() {
  const url = getSiteUrl().origin;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: SITE_NAME,
        url,
        description: SITE_DESCRIPTION,
        inLanguage: ["en", "uk"],
        publisher: { "@id": `${url}/#person` },
      },
      {
        "@type": "Person",
        "@id": `${url}/#person`,
        name: SITE_NAME,
        jobTitle: SITE_TAGLINE,
        url,
        email: `mailto:${contactEmail}`,
        sameAs: [...socialProfiles],
        knowsAbout: [
          "AI automation",
          "n8n",
          "workflow design",
          "Next.js",
          "full-stack engineering",
        ],
      },
      {
        "@type": "ProfessionalService",
        "@id": `${url}/#service`,
        name: `${SITE_NAME} — AI Automation Systems`,
        url,
        description: SITE_DESCRIPTION,
        image: `${url}/opengraph-image`,
        founder: { "@id": `${url}/#person` },
        areaServed: "Worldwide",
        serviceType: [
          "AI-powered workflows",
          "Custom full-stack systems",
          "Third-party integrations",
        ],
      },
    ],
  };
}
