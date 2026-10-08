import { Redirect, Stack, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type View as RNView,
} from "react-native";
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

function GlassesChip() {
  const { lazyEyeEnabled, activeProfile } = useLazyEye();
  if (!lazyEyeEnabled || !activeProfile) {
    return null;
  }
  return (
    <Pressable
      onPress={() => router.push("/(app)/settings/glasses")}
      style={styles.glassesChip}
      hitSlop={6}
    >
      <Text style={styles.glassesChipText} numberOfLines={1}>
        {activeProfile.name}
      </Text>
    </Pressable>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 12 });
  const avatarRef = useRef<RNView>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    avatarRef.current?.measureInWindow((_x, y, _width, height) => {
      setMenuPos({ top: y + height + 8, right: 12 });
    });
  }, [open]);

  if (!user) {
    return null;
  }

  return (
    <>
      <View ref={avatarRef}>
        <Pressable
          onPress={() => setOpen((value) => !value)}
          style={styles.avatar}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Profile menu"
        >
          <Text style={styles.avatarText}>{(user.name || user.email).slice(0, 1).toUpperCase()}</Text>
        </Pressable>
      </View>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.menuBackdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.menu, { top: menuPos.top, right: menuPos.right }]}>
            <Pressable
              onPress={() => {
                setOpen(false);
                router.push("/(app)/settings");
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>Settings</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setOpen(false);
                void logout().then(() => router.replace("/login"));
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>Sign out</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function HeaderRight() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  return (
    <View style={styles.headerRight}>
      <ModeToggle />
      <GlassesChip />
      <ProfileMenu />
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
      <Stack.Screen name="settings/index" options={{ title: "Settings" }} />
      <Stack.Screen name="settings/text-size" options={{ title: "Text size" }} />
      <Stack.Screen name="settings/glasses" options={{ title: "Glasses" }} />
      <Stack.Screen name="settings/srs" options={{ title: "Spaced repetition" }} />
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
  glassesChip: {
    maxWidth: 88,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  glassesChipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "700",
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
  menuBackdrop: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    width: 160,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 4,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
});
