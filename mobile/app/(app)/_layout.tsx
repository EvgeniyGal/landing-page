import { Redirect, Stack, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LazyEyeProvider, useLazyEye } from "@/src/anaglyph/LazyEyeContext";
import { useAuth } from "@/src/auth/session";
import { LoadingBlock } from "@/src/components/ui";
import { colors } from "@/src/theme";

function ModeToggle() {
  const { lazyEyeEnabled, setLazyEyeEnabled } = useLazyEye();
  return (
    <View style={styles.toggle}>
      <Pressable
        onPress={() => {
          void setLazyEyeEnabled(false);
        }}
        style={[styles.toggleBtn, !lazyEyeEnabled && styles.toggleBtnOn]}
      >
        <Text style={[styles.toggleText, !lazyEyeEnabled && styles.toggleTextOn]}>Regular</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          void setLazyEyeEnabled(true);
        }}
        style={[styles.toggleBtn, lazyEyeEnabled && styles.toggleBtnAccent]}
      >
        <Text style={styles.toggleText}>Lazy eye</Text>
      </Pressable>
    </View>
  );
}

function HeaderRight() {
  const { user, logout } = useAuth();
  if (!user) {
    return null;
  }
  return (
    <View style={styles.headerRight}>
      <ModeToggle />
      <Pressable
        onPress={() => router.push("/(app)/settings")}
        style={styles.avatar}
        hitSlop={8}
      >
        <Text style={styles.avatarText}>{(user.name || user.email).slice(0, 1).toUpperCase()}</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          void logout().then(() => router.replace("/login"));
        }}
        hitSlop={8}
      >
        <Text style={styles.signOut}>Sign out</Text>
      </Pressable>
    </View>
  );
}

function AppStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
        headerRight: () => <HeaderRight />,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
      <Stack.Screen name="decks/[id]/index" options={{ title: "Dictionary" }} />
      <Stack.Screen name="decks/[id]/add" options={{ title: "Add card" }} />
      <Stack.Screen name="decks/[id]/study" options={{ title: "Study", headerRight: () => <ModeToggle /> }} />
      <Stack.Screen name="decks/[id]/cards/[cardId]" options={{ title: "Edit card" }} />
    </Stack>
  );
}

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingBlock />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <LazyEyeProvider>
      <AppStack />
    </LazyEyeProvider>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    padding: 2,
  },
  toggleBtn: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  toggleBtnOn: {
    backgroundColor: "#fff",
  },
  toggleBtnAccent: {
    backgroundColor: colors.accent,
  },
  toggleText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
  },
  toggleTextOn: {
    color: "#000",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12,
  },
  signOut: {
    color: colors.mutedStrong,
    fontSize: 13,
    fontWeight: "600",
  },
});
