import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata, getHomeJsonLd } from "@/lib/seo";

export const dynamic = "force-static";
export const metadata = buildPageMetadata("home");

export default function Home() {
  return (
    <>
      <JsonLd data={getHomeJsonLd()} />
      <LandingPage />
    </>
  );
}
