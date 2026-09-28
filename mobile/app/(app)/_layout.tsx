import { Redirect, Stack, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/src/auth/session";
import { LoadingBlock } from "@/src/components/ui";
import { colors } from "@/src/theme";

export default function AppLayout() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <LoadingBlock />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "600" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
        headerRight: () => (
          <View style={styles.headerRight}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.name || user.email).slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                void logout().then(() => router.replace("/login"));
              }}
              hitSlop={8}
            >
              <Text style={styles.signOut}>Sign out</Text>
            </Pressable>
          </View>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="decks/[id]/index" options={{ title: "Dictionary" }} />
      <Stack.Screen name="decks/[id]/add" options={{ title: "Add card" }} />
      <Stack.Screen name="decks/[id]/study" options={{ title: "Study", headerRight: () => null }} />
      <Stack.Screen name="decks/[id]/cards/[cardId]" options={{ title: "Edit card" }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
