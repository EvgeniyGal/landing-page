import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getSiteUrl().origin;

  return [
    {
      url: origin,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${origin}/lazyeye-gym/privacy`,
      lastModified: new Date("2026-10-21"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
