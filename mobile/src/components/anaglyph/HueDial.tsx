import { useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, PanResponder, StyleSheet, Text, View } from "react-native";
import { clampHue, hslToCss } from "@/src/lib/anaglyph/color";

const DIAL_SIZE = 176;
const RING_WIDTH = 22;
const SEGMENT_COUNT = 72;

function snapHue(value: number) {
  return Math.round(clampHue(value) * 2) / 2;
}

function angleFromPoint(x: number, y: number, size: number) {
  const cx = size / 2;
  const cy = size / 2;
  const dx = x - cx;
  const dy = y - cy;
  const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return clampHue(degrees);
}

export function HueDial({
  hue,
  lightness,
  onChange,
}: {
  hue: number;
  lightness: number;
  onChange: (hue: number) => void;
}) {
  const [size, setSize] = useState(DIAL_SIZE);
  const sizeRef = useRef(DIAL_SIZE);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  function onLayout(event: LayoutChangeEvent) {
    const next = Math.max(1, event.nativeEvent.layout.width);
    sizeRef.current = next;
    setSize(next);
  }

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          onChangeRef.current(snapHue(angleFromPoint(locationX, locationY, sizeRef.current)));
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          onChangeRef.current(snapHue(angleFromPoint(locationX, locationY, sizeRef.current)));
        },
      }),
    [],
  );

  const center = hslToCss(hue, lightness);
  const thumbColor = hslToCss(hue, 50);
  const ringRadius = size / 2;
  const segmentStep = 360 / SEGMENT_COUNT;

  return (
    <View style={styles.column}>
      <View style={[styles.wrap, { width: size, height: size }]} onLayout={onLayout} {...panResponder.panHandlers}>
        <View style={[styles.ring, { width: size, height: size, borderRadius: ringRadius }]}>
          {Array.from({ length: SEGMENT_COUNT }, (_, index) => {
            const segmentHue = index * segmentStep;
            return (
              <View
                key={segmentHue}
                pointerEvents="none"
                style={[
                  styles.segmentHost,
                  {
                    width: size,
                    height: size,
                    transform: [{ rotate: `${segmentHue}deg` }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.segment,
                    {
                      left: size / 2 - 3,
                      width: 6,
                      height: RING_WIDTH,
                      backgroundColor: hslToCss(segmentHue, 50),
                    },
                  ]}
                />
              </View>
            );
          })}
          <View
            pointerEvents="none"
            style={[
              styles.center,
              {
                top: RING_WIDTH,
                left: RING_WIDTH,
                right: RING_WIDTH,
                bottom: RING_WIDTH,
                borderRadius: ringRadius - RING_WIDTH,
                backgroundColor: center,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.segmentHost,
              {
                width: size,
                height: size,
                transform: [{ rotate: `${clampHue(hue)}deg` }],
              },
            ]}
          >
            <View
              style={[
                styles.thumb,
                {
                  left: size / 2 - 9,
                  top: (RING_WIDTH - 18) / 2,
                  backgroundColor: thumbColor,
                },
              ]}
            />
          </View>
        </View>
      </View>
      <Text style={styles.degrees}>{hue.toFixed(1)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    alignItems: "center",
    gap: 8,
  },
  wrap: {
    alignSelf: "center",
  },
  ring: {
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.15)",
  },
  segmentHost: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  segment: {
    position: "absolute",
    top: 0,
  },
  center: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.35)",
  },
  thumb: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#fff",
  },
  degrees: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
  },
});
