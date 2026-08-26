import { LandingPage } from "@/components/landing/landing-page";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";
export const metadata = buildPageMetadata("home");

export default function Home() {
  return <LandingPage />;
}
