import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

export function ColorSlider({
  value,
  min,
  max,
  trackColors,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  trackColors: string[];
  onChange: (value: number) => void;
}) {
  const [width, setWidth] = useState(1);

  function updateFromX(x: number) {
    const ratio = Math.min(1, Math.max(0, x / width));
    onChange(min + ratio * (max - min));
  }

  function onLayout(event: LayoutChangeEvent) {
    setWidth(Math.max(1, event.nativeEvent.layout.width));
  }

  const thumbRatio = (value - min) / (max - min || 1);

  return (
    <View
      style={styles.track}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(event) => updateFromX(event.nativeEvent.locationX)}
      onResponderMove={(event) => updateFromX(event.nativeEvent.locationX)}
    >
      <View style={styles.segments} pointerEvents="none">
        {trackColors.map((color, index) => (
          <View key={`${color}-${index}`} style={[styles.segment, { backgroundColor: color }]} />
        ))}
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            left: `${thumbRatio * 100}%`,
            backgroundColor: trackColors[Math.floor(trackColors.length / 2)] ?? "#fff",
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 28,
    borderRadius: 999,
    overflow: "hidden",
    justifyContent: "center",
    backgroundColor: "#333",
  },
  segments: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
  },
  segment: {
    flex: 1,
  },
  thumb: {
    position: "absolute",
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
