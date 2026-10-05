import { Text, type TextStyle } from "react-native";
import type { AnaglyphColors } from "@/src/lib/anaglyph/color";
import { dichopticLetters, dichopticSyllables } from "@/src/lib/anaglyph/render";

export function DichopticText({
  text,
  colors,
  mode,
  neutralColor,
  style,
}: {
  text: string;
  colors: AnaglyphColors;
  mode: "letters" | "syllables";
  neutralColor: string;
  style?: TextStyle;
}) {
  const segments = mode === "letters" ? dichopticLetters(text, colors) : dichopticSyllables(text, colors);
  return (
    <Text style={style}>
      {segments.map((segment, index) => (
        <Text key={`${segment.text}-${index}`} style={{ color: segment.color ?? neutralColor }}>
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}
