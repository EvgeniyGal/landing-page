import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GlassProfilesSettings } from "@/components/app/glass-profiles-settings";
import { StudyTextScaleSettings } from "@/components/app/study-text-scale-settings";
import { ensureDefaultAnaglyphProfile, serializeAnaglyphProfile } from "@/lib/anaglyph/profiles";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profiles = await ensureDefaultAnaglyphProfile(session.user.id);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <StudyTextScaleSettings />
      <GlassProfilesSettings profiles={profiles.map(serializeAnaglyphProfile)} />
    </div>
  );
}
