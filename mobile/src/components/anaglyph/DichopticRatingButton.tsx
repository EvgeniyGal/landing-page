import { Pressable, StyleSheet, Text } from "react-native";
import { eyeColor, type AnaglyphColors } from "@/src/lib/anaglyph/color";

export function DichopticRatingButton({
  label,
  interval,
  colors,
  invert = false,
  disabled,
  onPress,
}: {
  label: string;
  interval?: string;
  colors: AnaglyphColors;
  /** When true, swap which eye color is background vs text. */
  invert?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const left = eyeColor(colors, "left");
  const right = eyeColor(colors, "right");
  const background = invert ? right : left;
  const foreground = invert ? left : right;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, { backgroundColor: background }, disabled && styles.disabled]}
    >
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
      {interval ? <Text style={[styles.interval, { color: foreground }]}>{interval}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "47%",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 28,
    fontWeight: "700",
    lineHeight: 32,
  },
  interval: {
    fontSize: 18,
    fontWeight: "600",
    opacity: 0.9,
    marginTop: 4,
  },
  disabled: {
    opacity: 0.55,
  },
});
