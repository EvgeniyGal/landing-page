import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata("notFound");

export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
      <p className="label-mono mb-4 text-[var(--muted)]">404</p>
      <h1 className="font-display max-w-xl text-3xl font-semibold tracking-[-0.02em] md:text-5xl">
        This page is not in the system.
      </h1>
      <p className="mt-4 max-w-md text-[var(--muted)]">
        The URL may be outdated or mistyped. Head back to the landing page to see services, projects, and contact
        options.
      </p>
      <Link href="/" className="ink-button label-mono mt-10 px-8 py-4">
        Return home
      </Link>
    </main>
  );
}
