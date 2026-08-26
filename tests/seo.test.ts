import assert from "node:assert/strict";
import test from "node:test";
import { buildPageMetadata, getSiteUrl, pages } from "../lib/seo";

test("getSiteUrl uses NEXT_PUBLIC_SITE_URL when set", () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://aiautomations.work/";

  assert.equal(getSiteUrl().origin, "https://aiautomations.work");

  if (previous === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});

test("every page has a unique title, description, and keywords", () => {
  const titles = Object.values(pages).map((page) => page.title);
  const descriptions = Object.values(pages).map((page) => page.description);
  const keywordSets = Object.values(pages).map((page) => page.keywords.join("|"));

  assert.equal(new Set(titles).size, titles.length);
  assert.equal(new Set(descriptions).size, descriptions.length);
  assert.equal(new Set(keywordSets).size, keywordSets.length);

  for (const page of Object.values(pages)) {
    assert.ok(page.title.length > 10);
    assert.ok(page.description.length > 40);
    assert.ok(page.keywords.length > 0);
  }
});

test("buildPageMetadata includes Open Graph and Twitter tags", () => {
  const metadata = buildPageMetadata("home");

  assert.equal(metadata.openGraph?.title, pages.home.title);
  assert.equal(metadata.openGraph?.description, pages.home.description);
  assert.deepEqual(metadata.twitter, {
    card: "summary_large_image",
    title: pages.home.title,
    description: pages.home.description,
  });
  assert.deepEqual(metadata.keywords, [...pages.home.keywords]);
});
