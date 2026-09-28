import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getAuthToken, resolveApiUrl } from "@/src/api/client";
import { colors } from "@/src/theme";

export function GeneratedBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>Generated</Text>
    </View>
  );
}

export function SpeakerButton({
  url,
  disabled,
}: {
  url?: string;
  disabled?: boolean;
}) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      playerRef.current?.remove();
      playerRef.current = null;
    };
  }, []);

  async function play() {
    if (!url || disabled) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
      });
      if (playerRef.current) {
        playerRef.current.remove();
        playerRef.current = null;
      }
      const token = getAuthToken();
      const player = createAudioPlayer({
        uri: resolveApiUrl(url),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      playerRef.current = player;
      player.play();
    } catch {
      setError("Could not play audio");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => void play()}
        disabled={busy || disabled || !url}
        style={({ pressed }) => [
          styles.button,
          (busy || disabled || !url) && styles.buttonDisabled,
          pressed && styles.buttonPressed,
        ]}
        accessibilityLabel="Play audio"
      >
        {busy ? <ActivityIndicator color={colors.text} size="small" /> : <Text style={styles.icon}>♪</Text>}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "flex-end",
    gap: 4,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonPressed: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  icon: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  error: {
    color: colors.danger,
    fontSize: 11,
    maxWidth: 140,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});
