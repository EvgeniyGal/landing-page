import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect } from "expo-router/react-navigation";
import { ErrorText, LoadingBlock } from "@/src/components/ui";
import { messageFromError } from "@/src/lib/format";
import {
  DEFAULT_STUDY_REMINDER_PREFS,
  formatReminderTime,
  readStudyReminderPrefs,
  type StudyReminderPrefs,
} from "@/src/lib/study-reminder-prefs";
import {
  requestStudyReminderPermissions,
  saveStudyReminderPrefsAndSync,
} from "@/src/notifications/study-reminder";
import { colors } from "@/src/theme";

function nudgeTime(prefs: StudyReminderPrefs, deltaMinutes: number): Pick<StudyReminderPrefs, "hour" | "minute"> {
  const total = ((prefs.hour * 60 + prefs.minute + deltaMinutes) % (24 * 60) + 24 * 60) % (24 * 60);
  return {
    hour: Math.floor(total / 60),
    minute: total % 60,
  };
}

export default function NotificationsSettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<StudyReminderPrefs>(DEFAULT_STUDY_REMINDER_PREFS);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        setLoading(true);
        setError(null);
        try {
          const next = await readStudyReminderPrefs();
          if (!cancelled) {
            setPrefs(next);
          }
        } catch (err) {
          if (!cancelled) {
            setError(messageFromError(err, "Could not load reminder settings."));
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

  async function apply(patch: Partial<Pick<StudyReminderPrefs, "enabled" | "hour" | "minute">>) {
    setPending(true);
    setError(null);
    setHint(null);
    try {
      if (patch.enabled) {
        const allowed = await requestStudyReminderPermissions();
        if (!allowed) {
          setError("Notification permission is required for study reminders.");
          setPrefs((current) => ({ ...current, enabled: false }));
          return;
        }
      }
      const result = await saveStudyReminderPrefsAndSync(patch);
      const next = await readStudyReminderPrefs();
      setPrefs(next);
      if (result.enabled && result.due <= 0) {
        setHint("Reminder is on. You’ll only be notified when cards are due.");
      } else if (result.enabled && result.scheduled) {
        setHint(
          result.presented
            ? `You have ${result.due} card${result.due === 1 ? "" : "s"} due — reminder sent.`
            : `Next reminder scheduled. ${result.due} card${result.due === 1 ? "" : "s"} due now.`,
        );
      }
    } catch (err) {
      setError(messageFromError(err, "Could not save reminder settings."));
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading…" />;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Study reminders</Text>
      <Text style={styles.subtitle}>
        Once a day at the time you choose. Notifies only when you have cards ready to study.
      </Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.rowTitle}>Daily reminder</Text>
            <Text style={styles.rowMeta}>Local device time</Text>
          </View>
          <Switch
            value={prefs.enabled}
            disabled={pending}
            onValueChange={(enabled) => {
              setPrefs((current) => ({ ...current, enabled }));
              void apply({ enabled });
            }}
            trackColor={{ false: "#333", true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={[styles.card, !prefs.enabled && styles.cardDisabled]}>
        <Text style={styles.label}>Remind me at</Text>
        <View style={styles.timeRow}>
          <Pressable
            style={styles.stepper}
            disabled={pending || !prefs.enabled}
            onPress={() => {
              const next = nudgeTime(prefs, -30);
              setPrefs((current) => ({ ...current, ...next }));
              void apply(next);
            }}
          >
            <Text style={styles.stepperText}>−30m</Text>
          </Pressable>
          <Text style={styles.timeValue}>{formatReminderTime(prefs.hour, prefs.minute)}</Text>
          <Pressable
            style={styles.stepper}
            disabled={pending || !prefs.enabled}
            onPress={() => {
              const next = nudgeTime(prefs, 30);
              setPrefs((current) => ({ ...current, ...next }));
              void apply(next);
            }}
          >
            <Text style={styles.stepperText}>+30m</Text>
          </Pressable>
        </View>
        <View style={styles.timeRow}>
          <Pressable
            style={styles.stepper}
            disabled={pending || !prefs.enabled}
            onPress={() => {
              const next = nudgeTime(prefs, -1);
              setPrefs((current) => ({ ...current, ...next }));
              void apply(next);
            }}
          >
            <Text style={styles.stepperText}>−1m</Text>
          </Pressable>
          <Pressable
            style={styles.stepper}
            disabled={pending || !prefs.enabled}
            onPress={() => {
              const next = nudgeTime(prefs, 1);
              setPrefs((current) => ({ ...current, ...next }));
              void apply(next);
            }}
          >
            <Text style={styles.stepperText}>+1m</Text>
          </Pressable>
        </View>
      </View>

      {error ? <ErrorText>{error}</ErrorText> : null}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 12 },
  title: { color: colors.text, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, marginBottom: 8, lineHeight: 20 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 12,
  },
  cardDisabled: { opacity: 0.45 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: "700" },
  rowMeta: { color: colors.muted, fontSize: 13 },
  label: { color: colors.mutedStrong, fontSize: 12, textTransform: "uppercase" },
  timeRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  timeValue: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    minWidth: 120,
    textAlign: "center",
  },
  stepper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.input,
  },
  stepperText: { color: colors.text, fontWeight: "600" },
  hint: { color: colors.mutedStrong, fontSize: 13, lineHeight: 18 },
});
