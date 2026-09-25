"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
  ssr: false,
  loading: () => <p className="text-sm text-zinc-500">Loading API docs…</p>,
});

export function SwaggerUiClient({ url }: { url: string }) {
  return (
    <SwaggerUI
      url={url}
      docExpansion="list"
      defaultModelsExpandDepth={1}
      tryItOutEnabled
      persistAuthorization
    />
  );
}
