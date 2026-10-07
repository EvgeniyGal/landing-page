import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/theme";

export default function SettingsIndexScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Choose what to configure on this device.</Text>

      <Pressable
        style={styles.row}
        onPress={() => router.push("/(app)/settings/text-size")}
      >
        <View style={styles.copy}>
          <Text style={styles.rowTitle}>Text size</Text>
          <Text style={styles.rowMeta}>Word, example, and explanation scales</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={() => router.push("/(app)/settings/glasses")}
      >
        <View style={styles.copy}>
          <Text style={styles.rowTitle}>Glasses</Text>
          <Text style={styles.rowMeta}>Presets for this screen; in-use choice stays on device</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginBottom: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  rowMeta: { color: colors.muted, fontSize: 13 },
  chevron: { color: colors.mutedStrong, fontSize: 28, lineHeight: 28 },
});
