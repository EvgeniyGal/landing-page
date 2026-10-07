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
  activateAnaglyphProfile,
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
import {
  TEXT_SCALE_LABELS,
  TEXT_SCALE_STEPS,
  type StudyTextScales,
  type TextScaleStep,
} from "@/src/lib/text-scale";
import { colors } from "@/src/theme";

const HUE_STOPS = [0, 60, 120, 180, 240, 300, 360].map((hue) => hslToCss(hue, 50));

const TEXT_SCALE_ROWS: {
  key: keyof StudyTextScales;
  label: string;
  preview: string;
  baseSize: number;
  baseLineHeight: number;
}[] = [
  { key: "wordTextScale", label: "Word", preview: "apple", baseSize: 28, baseLineHeight: 34 },
  {
    key: "exampleTextScale",
    label: "Example",
    preview: "I ate an apple.",
    baseSize: 15,
    baseLineHeight: 22,
  },
  {
    key: "explanationTextScale",
    label: "Explanation",
    preview: "A round fruit that grows on trees.",
    baseSize: 15,
    baseLineHeight: 22,
  },
];

function TextScaleSection() {
  const {
    wordTextScale,
    exampleTextScale,
    explanationTextScale,
    setStudyTextScales,
  } = useLazyEye();
  const [busy, setBusy] = useState(false);
  const scales: StudyTextScales = {
    wordTextScale,
    exampleTextScale,
    explanationTextScale,
  };

  async function choose(key: keyof StudyTextScales, step: TextScaleStep) {
    if (scales[key] === step || busy) {
      return;
    }
    setBusy(true);
    try {
      await setStudyTextScales({ [key]: step });
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.textScaleSection}>
      <Text style={styles.title}>Text size</Text>
      <Text style={styles.subtitle}>
        Scale study card text. Useful for lazy-eye training and readability.
      </Text>
      {TEXT_SCALE_ROWS.map((row) => {
        const scale = scales[row.key];
        return (
          <View key={row.key} style={styles.textScaleRow}>
            <Text style={styles.label}>{row.label}</Text>
            <View style={styles.row}>
              {TEXT_SCALE_STEPS.map((step) => {
                const active = scale === step;
                return (
                  <Pressable
                    key={step}
                    disabled={busy}
                    onPress={() => void choose(row.key, step)}
                    style={[styles.scaleChip, active && styles.scaleChipActive]}
                  >
                    <Text style={[styles.scaleChipText, active && styles.scaleChipTextActive]}>
                      {TEXT_SCALE_LABELS[step]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text
              style={{
                color: colors.text,
                fontSize: row.baseSize * scale,
                lineHeight: row.baseLineHeight * scale,
                marginTop: 4,
              }}
            >
              {row.preview}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const { refresh } = useLazyEye();
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
      setProfiles(result.profiles);
      setSelectedId(result.profiles.find((p) => p.isActive)?.id ?? result.profiles[0]?.id ?? "");
    } catch (err) {
      setError(messageFromError(err, "Could not load glasses."));
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (profiles.find((profile) => profile.id === profileId)?.isActive) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await activateAnaglyphProfile(profileId);
      setProfiles((current) =>
        current.map((profile) => ({ ...profile, isActive: profile.id === profileId })),
      );
      await refresh();
    } catch (err) {
      setError(messageFromError(err, "Could not switch glasses."));
    } finally {
      setBusy(false);
    }
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
      await activateAnaglyphProfile(created.profile.id);
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
        <TextScaleSection />
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
      <TextScaleSection />
      <Text style={styles.title}>Glasses</Text>
      <Text style={styles.subtitle}>Name each pair for a screen, then tap a preset to use it.</Text>
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
            void deleteAnaglyphProfile(selected.id)
              .then(() => Promise.all([load(), refresh()]))
              .catch((err) => setError(messageFromError(err, "Could not delete.")));
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
  screenPad: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 },
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginBottom: 4 },
  textScaleSection: { gap: 12, marginBottom: 8 },
  textScaleRow: { gap: 8 },
  scaleChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scaleChipActive: { backgroundColor: "#fff" },
  scaleChipText: { color: colors.text, fontWeight: "600", fontSize: 12 },
  scaleChipTextActive: { color: "#111" },
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
