import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router/react-navigation";
import { getPreferences, setPreferences } from "@/src/api/endpoints";
import { ErrorText, LoadingBlock, PrimaryButton, SecondaryButton } from "@/src/components/ui";
import { messageFromError } from "@/src/lib/format";
import {
  DEFAULT_SRS_PREFS,
  SRS_FIELDS,
  normalizeSrsPrefs,
  type SrsFieldKey,
  type SrsPrefs,
} from "@/src/lib/srs-config";
import { colors } from "@/src/theme";

export default function SrsSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<SrsPrefs>(DEFAULT_SRS_PREFS);
  const [saved, setSaved] = useState<SrsPrefs>(DEFAULT_SRS_PREFS);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        setLoading(true);
        setError(null);
        try {
          const result = await getPreferences();
          if (cancelled) {
            return;
          }
          const next = normalizeSrsPrefs(result.preferences);
          setDraft(next);
          setSaved(next);
        } catch (err) {
          if (!cancelled) {
            setError(messageFromError(err, "Could not load preferences."));
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
      void load();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function nudge(key: SrsFieldKey, delta: number, min: number, max: number) {
    setDraft((current) =>
      normalizeSrsPrefs({
        ...current,
        [key]: Math.min(max, Math.max(min, Number((current[key] + delta).toFixed(2)))),
      }),
    );
  }

  async function onSave() {
    setPending(true);
    setError(null);
    try {
      const result = await setPreferences(draft);
      const next = normalizeSrsPrefs(result.preferences);
      setDraft(next);
      setSaved(next);
    } catch (err) {
      setError(messageFromError(err, "Could not save preferences."));
    } finally {
      setPending(false);
    }
  }

  function onReset() {
    setDraft(DEFAULT_SRS_PREFS);
    setError(null);
  }

  if (loading) {
    return <LoadingBlock label="Loading…" />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Spaced repetition</Text>
      <Text style={styles.subtitle}>
        Synced across devices. Changes apply to future reviews only.
      </Text>

      {SRS_FIELDS.map((field) => {
        const value = draft[field.key];
        return (
          <View key={field.key} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>{field.label}</Text>
              <Text style={styles.value}>{value.toFixed(2)}</Text>
            </View>
            <View style={styles.stepper}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => nudge(field.key, -field.step, field.min, field.max)}
              >
                <Text style={styles.stepBtnText}>−</Text>
              </Pressable>
              <Text style={styles.rangeHint}>
                {field.min} – {field.max}
              </Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => nudge(field.key, field.step, field.min, field.max)}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.help}>{field.help}</Text>
            <Text style={styles.example}>{field.example(value)}</Text>
          </View>
        );
      })}

      <ErrorText>{error}</ErrorText>

      <View style={styles.actions}>
        <PrimaryButton
          label={pending ? "Saving…" : "Save"}
          loading={pending}
          disabled={!dirty}
          onPress={() => void onSave()}
        />
        <SecondaryButton label="Reset to defaults" disabled={pending} onPress={onReset} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14, paddingBottom: 48 },
  title: { color: colors.text, fontSize: 24, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 13, marginBottom: 4 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 10,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { color: colors.text, fontSize: 15, fontWeight: "700" },
  value: { color: "#7eb6ff", fontSize: 15, fontFamily: "monospace", fontWeight: "600" },
  stepper: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnText: { color: colors.text, fontSize: 22, fontWeight: "600", lineHeight: 24 },
  rangeHint: { color: colors.muted, fontSize: 12 },
  help: { color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 18 },
  example: { color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 18 },
  actions: { gap: 10, marginTop: 4 },
});
