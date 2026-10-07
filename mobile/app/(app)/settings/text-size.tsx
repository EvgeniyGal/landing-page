import { ScrollView, StyleSheet, Text, View, Pressable } from "react-native";
import { useLazyEye } from "@/src/anaglyph/LazyEyeContext";
import {
  TEXT_SCALE_LABELS,
  TEXT_SCALE_STEPS,
  type StudyMode,
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

const MODE_SECTIONS: { mode: StudyMode; title: string; hint: string }[] = [
  {
    mode: "regular",
    title: "Regular",
    hint: "Used when Regular mode is selected on this device.",
  },
  {
    mode: "lazyEye",
    title: "Lazy eye",
    hint: "Used when Lazy eye mode is selected on this device.",
  },
];

export default function TextSizeSettingsScreen() {
  const { textScalePrefs, setStudyTextScales, lazyEyeEnabled } = useLazyEye();

  function choose(mode: StudyMode, key: keyof StudyTextScales, step: TextScaleStep) {
    if (textScalePrefs[mode][key] === step) {
      return;
    }
    void setStudyTextScales({ [key]: step }, mode);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Text size</Text>
      <Text style={styles.subtitle}>
        Saved on this device only. Configure Regular and Lazy eye independently.
      </Text>

      {MODE_SECTIONS.map((section) => {
        const scales = textScalePrefs[section.mode];
        const isCurrent = (section.mode === "lazyEye") === lazyEyeEnabled;
        return (
          <View key={section.mode} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.flex}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionHint}>{section.hint}</Text>
              </View>
              {isCurrent ? <Text style={styles.inUse}>In use</Text> : null}
            </View>

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
                          onPress={() => choose(section.mode, row.key, step)}
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
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginBottom: 4 },
  section: {
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#1a1a1a",
    padding: 14,
  },
  sectionHeader: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1, minWidth: 0, gap: 4 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  sectionHint: { color: colors.muted, fontSize: 12 },
  inUse: {
    color: "#7eb6ff",
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "rgba(61,139,255,0.2)",
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
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
