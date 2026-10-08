import { getOrCreatePreferences } from "@/lib/anaglyph/profiles";
import { srsConfigFromPreferences } from "@/lib/srs/config";

export async function getUserSrsConfig(userId: string) {
  const prefs = await getOrCreatePreferences(userId);
  return srsConfigFromPreferences(prefs);
}
