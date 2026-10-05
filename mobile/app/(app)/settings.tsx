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
import { colors } from "@/src/theme";

const HUE_STOPS = [0, 60, 120, 180, 240, 300, 360].map((hue) => hslToCss(hue, 50));

export default function SettingsScreen() {
  const { refresh } = useLazyEye();
  const [profiles, setProfiles] = useState<AnaglyphProfile[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [eye, setEye] = useState<EyeSide>("left");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAnaglyphProfiles();
      setProfiles(result.profiles);
      setSelectedId(result.profiles.find((p) => p.isActive)?.id ?? result.profiles[0]?.id ?? "");
    } catch (err) {
      setError(messageFromError(err, "Could not load glasses profiles."));
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

  async function save() {
    if (!selected) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateAnaglyphProfile(selected.id, {
        name: selected.name,
        leftHue: selected.leftHue,
        leftLightness: selected.leftLightness,
        rightHue: selected.rightHue,
        rightLightness: selected.rightLightness,
        background: selected.background,
      });
      await refresh();
    } catch (err) {
      setError(messageFromError(err, "Could not save profile."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading settings…" />;
  }

  if (!selected || !anaglyphColors) {
    return (
      <View style={styles.screen}>
        <ErrorText>{error}</ErrorText>
        <Pressable
          style={styles.primaryButton}
          onPress={() => {
            void createAnaglyphProfile({
              name: "Default",
              leftHue: 0,
              leftLightness: 50,
              rightHue: 180,
              rightLightness: 50,
              background: "black",
            }).then(load);
          }}
        >
          <Text style={styles.primaryButtonText}>Create profile</Text>
        </Pressable>
      </View>
    );
  }

  const previewBg = backgroundCss(selected.background);
  const previewFg = neutralForeground(selected.background);
  const activeHue = eye === "left" ? selected.leftHue : selected.rightHue;
  const activeLightness = eye === "left" ? selected.leftLightness : selected.rightLightness;
  const lightnessStops = [8, 50, 92].map((lightness) => hslToCss(activeHue, lightness));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Glasses settings</Text>
      <Text style={styles.subtitle}>Save one profile per screen — phones and monitors differ.</Text>
      <ErrorText>{error}</ErrorText>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {profiles.map((profile) => (
          <Pressable
            key={profile.id}
            onPress={() => setSelectedId(profile.id)}
            style={[styles.chip, profile.id === selected.id && styles.chipActive]}
          >
            <Text style={styles.chipText}>
              {profile.name}
              {profile.isActive ? " · active" : ""}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        value={selected.name}
        onChangeText={(name) => patchSelected({ name })}
        style={styles.input}
        placeholder="Profile name"
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
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: eyeColor(anaglyphColors, "left") }]} />
          <View style={[styles.dot, { backgroundColor: eyeColor(anaglyphColors, "right") }]} />
        </View>
      </View>

      <Pressable style={styles.primaryButton} disabled={busy} onPress={() => void save()}>
        <Text style={styles.primaryButtonText}>Save</Text>
      </Pressable>

      {!selected.isActive ? (
        <Pressable
          style={styles.secondaryButton}
          disabled={busy}
          onPress={() => {
            void activateAnaglyphProfile(selected.id)
              .then(() => Promise.all([load(), refresh()]))
              .catch((err) => setError(messageFromError(err, "Could not activate.")));
          }}
        >
          <Text style={styles.secondaryButtonText}>Set active</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.secondaryButton}
        disabled={busy}
        onPress={() => {
          void createAnaglyphProfile({
            name: `Screen ${profiles.length + 1}`,
            leftHue: 0,
            leftLightness: 50,
            rightHue: 180,
            rightLightness: 50,
            background: "black",
          })
            .then(load)
            .catch((err) => setError(messageFromError(err, "Could not create.")));
        }}
      >
        <Text style={styles.secondaryButtonText}>Add profile</Text>
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
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginBottom: 8 },
  chips: { maxHeight: 44 },
  chip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.text, fontSize: 13, fontWeight: "600" },
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
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryButtonText: { color: colors.text, fontWeight: "700" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
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
