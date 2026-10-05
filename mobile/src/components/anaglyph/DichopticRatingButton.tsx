import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { DichopticText } from "@/src/components/anaglyph/DichopticText";
import {
  contrastTextForLightness,
  eyeColor,
  type AnaglyphColors,
} from "@/src/lib/anaglyph/color";

export function DichopticRatingButton({
  label,
  interval,
  colors,
  disabled,
  onPress,
}: {
  label: string;
  interval?: string;
  colors: AnaglyphColors;
  disabled?: boolean;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const leftOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const rightOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] });
  const labelColor = contrastTextForLightness((colors.leftLightness + colors.rightLightness) / 2);

  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.button, disabled && styles.disabled]}>
      <Animated.View style={[styles.half, styles.left, { backgroundColor: eyeColor(colors, "left"), opacity: leftOpacity }]} />
      <Animated.View style={[styles.half, styles.right, { backgroundColor: eyeColor(colors, "right"), opacity: rightOpacity }]} />
      <View style={styles.content}>
        <DichopticText text={label} colors={colors} mode="letters" neutralColor={labelColor} style={styles.label} />
        {interval ? <Text style={[styles.interval, { color: labelColor }]}>{interval}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "47%",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 56,
    justifyContent: "center",
  },
  half: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%",
  },
  left: { left: 0 },
  right: { right: 0 },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  interval: {
    fontSize: 11,
    opacity: 0.8,
    marginTop: 2,
  },
  disabled: {
    opacity: 0.55,
  },
});
