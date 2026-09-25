import type { Metadata } from "next";
import { SwaggerUiClient } from "@/components/api/swagger-ui-client";

export const metadata: Metadata = {
  title: "API docs",
  description: "Interactive OpenAPI (Swagger) documentation for the flashcard platform API.",
  robots: { index: false, follow: false },
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-zinc-200 bg-zinc-50 px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-lg font-semibold text-zinc-900">Flashcard API</h1>
          <p className="mt-1 text-sm text-zinc-600">
            OpenAPI JSON at{" "}
            <a className="text-sky-700 underline" href="/api/v1/openapi">
              /api/v1/openapi
            </a>
            . Authorize with a Bearer token from{" "}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">POST /api/v1/auth/login</code>.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-2 py-4">
        <SwaggerUiClient url="/api/v1/openapi" />
      </div>
    </div>
  );
}
