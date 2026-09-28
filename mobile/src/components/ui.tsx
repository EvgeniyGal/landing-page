import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type PressableProps,
} from "react-native";
import { colors } from "@/src/theme";

export function Screen({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function ErrorText({ children }: { children?: string | null }) {
  if (!children) {
    return null;
  }
  return <Text style={styles.error}>{children}</Text>;
}

export function Field(props: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor="rgba(255,255,255,0.35)"
      {...props}
      style={[styles.input, props.multiline && styles.textarea, props.style]}
    />
  );
}

export function PrimaryButton({
  label,
  loading,
  disabled,
  style,
  ...props
}: PressableProps & { label: string; loading?: boolean; disabled?: boolean }) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={(state) => [
        styles.primary,
        isDisabled && styles.disabled,
        state.pressed && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  loading,
  disabled,
  style,
  ...props
}: PressableProps & { label: string; loading?: boolean; disabled?: boolean }) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={(state) => [
        styles.secondary,
        isDisabled && styles.disabled,
        state.pressed && styles.pressed,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <Text style={styles.secondaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function ChipButton({
  label,
  loading,
  disabled,
  ...props
}: PressableProps & { label: string; loading?: boolean; disabled?: boolean }) {
  const isDisabled = Boolean(disabled || loading);
  return (
    <Pressable
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.chip,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.chipText}>{loading ? "…" : label}</Text>
    </Pressable>
  );
}

export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={colors.accent} />
      <Muted>{label}</Muted>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  muted: {
    color: colors.muted,
    fontSize: 14,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  textarea: {
    minHeight: 88,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  primary: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  secondary: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: "transparent",
  },
  secondaryText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
  chip: {
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  chipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.88,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.bg,
  },
});
