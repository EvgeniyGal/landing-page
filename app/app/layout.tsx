import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { getLazyEyeStudyContext, serializeAnaglyphProfile } from "@/lib/anaglyph/profiles";

export const metadata = {
  title: "Study",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LearnerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const context = await getLazyEyeStudyContext(session.user.id!);
  const profiles = context.profiles.map(serializeAnaglyphProfile);
  const activeProfile = context.activeProfile
    ? serializeAnaglyphProfile(context.activeProfile)
    : null;

  return (
    <AppShell
      email={session.user.email ?? ""}
      role={session.user.role}
      lazyEyeEnabled={context.lazyEyeEnabled}
      wordTextScale={context.wordTextScale}
      exampleTextScale={context.exampleTextScale}
      explanationTextScale={context.explanationTextScale}
      activeProfile={activeProfile}
      profiles={profiles}
    >
      {children}
    </AppShell>
  );
}
