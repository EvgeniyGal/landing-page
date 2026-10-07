import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router/react-navigation";
import {
  createAnaglyphProfile,
  deleteAnaglyphProfile,
  listAnaglyphProfiles,
  updateAnaglyphProfile,
} from "@/src/api/endpoints";
import type { AnaglyphBackground, AnaglyphProfile } from "@/src/api/types";
import { useLazyEye } from "@/src/anaglyph/LazyEyeContext";
import { ColorSlider } from "@/src/components/anaglyph/ColorSlider";
import { DichopticText } from "@/src/components/anaglyph/DichopticText";
import { ErrorText, LoadingBlock } from "@/src/components/ui";
import {
  backgroundCss,
  eyeColor,
  hslToCss,
  neutralForeground,
  type EyeSide,
} from "@/src/lib/anaglyph/color";
import { messageFromError } from "@/src/lib/format";
import { withLocalActiveFlag } from "@/src/lib/device-profile";
import { colors } from "@/src/theme";

const HUE_STOPS = [0, 60, 120, 180, 240, 300, 360].map((hue) => hslToCss(hue, 50));

export default function GlassesSettingsScreen() {
  const { refresh, activateProfile, activeProfile } = useLazyEye();
  const [profiles, setProfiles] = useState<AnaglyphProfile[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [eye, setEye] = useState<EyeSide>("left");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAnaglyphProfiles();
      const activeId = activeProfile?.id;
      const localized = withLocalActiveFlag(result.profiles, activeId ?? null);
      setProfiles(localized);
      setSelectedId(
        localized.find((p) => p.isActive)?.id ?? localized[0]?.id ?? "",
      );
    } catch (err) {
      setError(messageFromError(err, "Could not load glasses."));
    } finally {
      setLoading(false);
    }
  }, [activeProfile?.id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const selected = profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? null;
  const anaglyphColors = useMemo(
    () =>
      selected
        ? {
            leftHue: selected.leftHue,
            leftLightness: selected.leftLightness,
            rightHue: selected.rightHue,
            rightLightness: selected.rightLightness,
          }
        : null,
    [selected],
  );

  function patchSelected(patch: Partial<AnaglyphProfile>) {
    if (!selected) {
      return;
    }
    setProfiles((current) =>
      current.map((profile) => (profile.id === selected.id ? { ...profile, ...patch } : profile)),
    );
  }

  async function choosePreset(profileId: string) {
    setSelectedId(profileId);
    setError(null);
    await activateProfile(profileId);
    setProfiles((current) => withLocalActiveFlag(current, profileId));
  }

  async function save() {
    if (!selected) {
      return;
    }
    if (!selected.name.trim()) {
      setError("Give these glasses a name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateAnaglyphProfile(selected.id, {
        name: selected.name.trim(),
        leftHue: selected.leftHue,
        leftLightness: selected.leftLightness,
        rightHue: selected.rightHue,
        rightLightness: selected.rightLightness,
        background: selected.background,
      });
      await Promise.all([load(), refresh()]);
    } catch (err) {
      setError(messageFromError(err, "Could not save glasses."));
    } finally {
      setBusy(false);
    }
  }

  async function createNamed() {
    const name = newName.trim();
    if (!name) {
      setError("Enter a name for the new glasses.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await createAnaglyphProfile({
        name,
        leftHue: selected?.leftHue ?? 0,
        leftLightness: selected?.leftLightness ?? 50,
        rightHue: selected?.rightHue ?? 180,
        rightLightness: selected?.rightLightness ?? 50,
        background: selected?.background ?? "black",
      });
      await activateProfile(created.profile.id);
      setCreating(false);
      setNewName("");
      await Promise.all([load(), refresh()]);
    } catch (err) {
      setError(messageFromError(err, "Could not save glasses."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading glasses…" />;
  }

  if (!selected || !anaglyphColors) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Glasses</Text>
        <ErrorText>{error}</ErrorText>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="e.g. Phone, Laptop"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable style={styles.primaryButton} onPress={() => void createNamed()}>
          <Text style={styles.primaryButtonText}>Save glasses</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const previewBg = backgroundCss(selected.background);
  const previewFg = neutralForeground(selected.background);
  const activeHue = eye === "left" ? selected.leftHue : selected.rightHue;
  const activeLightness = eye === "left" ? selected.leftLightness : selected.rightLightness;
  const lightnessStops = [8, 50, 92].map((lightness) => hslToCss(activeHue, lightness));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Glasses</Text>
      <Text style={styles.subtitle}>
        Presets sync across devices; which pair is in use is remembered on this device.
      </Text>
      <ErrorText>{error}</ErrorText>

      <Pressable
        style={styles.secondaryButton}
        disabled={busy}
        onPress={() => {
          setCreating(true);
          setNewName("");
          setError(null);
        }}
      >
        <Text style={styles.secondaryButtonText}>Save new glasses</Text>
      </Pressable>

      {creating ? (
        <View style={styles.createBox}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Glasses name (Phone, Laptop…)"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus
          />
          <View style={styles.row}>
            <Pressable style={styles.primaryButtonInline} disabled={busy} onPress={() => void createNamed()}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryButtonInline}
              disabled={busy}
              onPress={() => {
                setCreating(false);
                setNewName("");
              }}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Text style={styles.label}>Choose preset</Text>
      {profiles.map((profile) => {
        const profileColors = {
          leftHue: profile.leftHue,
          leftLightness: profile.leftLightness,
          rightHue: profile.rightHue,
          rightLightness: profile.rightLightness,
        };
        return (
          <Pressable
            key={profile.id}
            disabled={busy}
            onPress={() => void choosePreset(profile.id)}
            style={[styles.presetCard, profile.isActive && styles.presetCardActive]}
          >
            <View style={styles.swatchPair}>
              <View style={[styles.dot, { backgroundColor: eyeColor(profileColors, "left") }]} />
              <View style={[styles.dotOverlap, { backgroundColor: eyeColor(profileColors, "right") }]} />
            </View>
            <View style={styles.presetCopy}>
              <Text style={styles.presetName}>{profile.name}</Text>
              <Text style={styles.presetMeta}>{profile.background} background</Text>
            </View>
            <Text style={styles.presetStatus}>{profile.isActive ? "In use" : "Tap to use"}</Text>
          </Pressable>
        );
      })}

      <Text style={styles.label}>Glasses name</Text>
      <TextInput
        value={selected.name}
        onChangeText={(name) => patchSelected({ name })}
        style={styles.input}
        placeholder="Phone, Laptop, Office monitor…"
        placeholderTextColor={colors.muted}
      />

      <View style={styles.row}>
        {(["left", "right"] as const).map((side) => (
          <Pressable
            key={side}
            onPress={() => setEye(side)}
            style={[styles.eyeChip, eye === side && styles.eyeChipActive]}
          >
            <Text style={[styles.eyeChipText, eye === side && styles.eyeChipTextActive]}>
              {side} eye
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.swatch, { backgroundColor: hslToCss(activeHue, activeLightness) }]} />

      <Text style={styles.label}>Hue</Text>
      <ColorSlider
        value={activeHue}
        min={0}
        max={360}
        trackColors={HUE_STOPS}
        onChange={(hue) => patchSelected(eye === "left" ? { leftHue: hue } : { rightHue: hue })}
      />

      <Text style={styles.label}>Brightness</Text>
      <ColorSlider
        value={activeLightness}
        min={8}
        max={92}
        trackColors={lightnessStops}
        onChange={(lightness) =>
          patchSelected(eye === "left" ? { leftLightness: lightness } : { rightLightness: lightness })
        }
      />

      <Text style={styles.label}>Background</Text>
      <View style={styles.row}>
        {(["black", "gray", "white"] as AnaglyphBackground[]).map((background) => (
          <Pressable
            key={background}
            onPress={() => patchSelected({ background })}
            style={[styles.eyeChip, selected.background === background && styles.eyeChipActive]}
          >
            <Text style={[styles.eyeChipText, selected.background === background && styles.eyeChipTextActive]}>
              {background}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.preview, { backgroundColor: previewBg }]}>
        <DichopticText
          text="abolish"
          colors={anaglyphColors}
          mode="letters"
          neutralColor={previewFg}
          style={styles.previewWord}
        />
        <DichopticText
          text="The government decided to abolish the outdated law."
          colors={anaglyphColors}
          mode="syllables"
          neutralColor={previewFg}
          style={styles.previewLine}
        />
      </View>

      <Pressable style={styles.primaryButton} disabled={busy} onPress={() => void save()}>
        <Text style={styles.primaryButtonText}>Save changes</Text>
      </Pressable>

      {profiles.length > 1 ? (
        <Pressable
          style={styles.dangerButton}
          disabled={busy}
          onPress={() => {
            void (async () => {
              try {
                const deletedId = selected.id;
                await deleteAnaglyphProfile(deletedId);
                const remaining = profiles.filter((profile) => profile.id !== deletedId);
                const nextId = remaining[0]?.id;
                if (nextId) {
                  await activateProfile(nextId);
                }
                await Promise.all([load(), refresh()]);
              } catch (err) {
                setError(messageFromError(err, "Could not delete."));
              }
            })();
          }}
        >
          <Text style={styles.dangerButtonText}>Delete</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginBottom: 4 },
  createBox: { gap: 10, padding: 12, borderRadius: 16, backgroundColor: "#1a1a1a" },
  presetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  presetCardActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(61,139,255,0.15)",
  },
  swatchPair: { flexDirection: "row", width: 44 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "#1a1a1a" },
  dotOverlap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#1a1a1a",
    marginLeft: -10,
  },
  presetCopy: { flex: 1, minWidth: 0 },
  presetName: { color: colors.text, fontWeight: "700", fontSize: 15 },
  presetMeta: { color: colors.muted, fontSize: 12, textTransform: "capitalize", marginTop: 2 },
  presetStatus: { color: colors.mutedStrong, fontSize: 11, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    backgroundColor: "#141414",
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  eyeChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eyeChipActive: { backgroundColor: "#fff" },
  eyeChipText: { color: colors.text, fontWeight: "600", textTransform: "capitalize" },
  eyeChipTextActive: { color: "#111" },
  swatch: { height: 64, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.mutedStrong, fontSize: 12, textTransform: "uppercase", marginTop: 4 },
  preview: { borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: colors.border },
  previewWord: { fontSize: 28, fontWeight: "700" },
  previewLine: { fontSize: 15, lineHeight: 22 },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonInline: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryButtonText: { color: colors.text, fontWeight: "700" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonInline: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  secondaryButtonText: { color: colors.text, fontWeight: "600" },
  dangerButton: {
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.4)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerButtonText: { color: "#fca5a5", fontWeight: "600" },
});
