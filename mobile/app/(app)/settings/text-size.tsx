import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLazyEye } from "@/src/anaglyph/LazyEyeContext";
import {
  TEXT_SCALE_LABELS,
  TEXT_SCALE_STEPS,
  type StudyTextScales,
  type TextScaleStep,
} from "@/src/lib/text-scale";
import { colors } from "@/src/theme";

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

export default function TextSizeSettingsScreen() {
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginBottom: 4 },
  textScaleRow: { gap: 8 },
  label: { color: colors.mutedStrong, fontSize: 12, textTransform: "uppercase" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  scaleChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scaleChipActive: { backgroundColor: "#fff" },
  scaleChipText: { color: colors.text, fontWeight: "600", fontSize: 12 },
  scaleChipTextActive: { color: "#111" },
});
