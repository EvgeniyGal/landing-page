import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createFlashcard, generateAudio } from "@/src/api/endpoints";
import type { AudioKind, Flashcard } from "@/src/api/types";
import { GeneratedBadge, SpeakerButton } from "@/src/components/SpeakerButton";
import {
  ChipButton,
  ErrorText,
  Field,
  PrimaryButton,
} from "@/src/components/ui";
import { cardHead, messageFromError } from "@/src/lib/format";
import { colors } from "@/src/theme";

const EXAMPLE_KINDS = ["example_1", "example_2", "example_3"] as const;

export default function AddCardScreen() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const [word, setWord] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [card, setCard] = useState<Flashcard | null>(null);
  const [selectedExamples, setSelectedExamples] = useState<(typeof EXAMPLE_KINDS)[number][]>([]);
  const [voiceBusy, setVoiceBusy] = useState<"word" | "examples" | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  async function onGenerate() {
    if (!deckId) {
      return;
    }
    setPending(true);
    setError(null);
    setVoiceError(null);
    try {
      const result = await createFlashcard(word.trim(), deckId);
      setCard(result.card);
      setSelectedExamples([]);
      setWord("");
    } catch (err) {
      setError(messageFromError(err, "Could not generate a flashcard."));
    } finally {
      setPending(false);
    }
  }

  function toggleExample(kind: (typeof EXAMPLE_KINDS)[number]) {
    setSelectedExamples((current) =>
      current.includes(kind) ? current.filter((item) => item !== kind) : [...current, kind],
    );
  }

  async function generateWordVoice() {
    if (!card) {
      return;
    }
    setVoiceBusy("word");
    setVoiceError(null);
    try {
      const result = await generateAudio(card.id, "word");
      setCard((current) => (current ? { ...current, audio: { ...current.audio, ...result.audio } } : current));
    } catch (err) {
      setVoiceError(messageFromError(err, "Could not generate audio."));
    } finally {
      setVoiceBusy(null);
    }
  }

  async function generateSelectedExamples() {
    if (!card || selectedExamples.length === 0) {
      return;
    }
    const kinds = selectedExamples.filter((kind) => !card.audio[kind]);
    if (!kinds.length) {
      return;
    }
    setVoiceBusy("examples");
    setVoiceError(null);
    try {
      const audio: Partial<Record<AudioKind, string>> = {};
      for (const kind of kinds) {
        const result = await generateAudio(card.id, kind);
        Object.assign(audio, result.audio);
      }
      setCard((current) => (current ? { ...current, audio: { ...current.audio, ...audio } } : current));
      setSelectedExamples((current) => current.filter((kind) => !kinds.includes(kind)));
    } catch (err) {
      setVoiceError(messageFromError(err, "Could not generate audio."));
    } finally {
      setVoiceBusy(null);
    }
  }

  const head = card ? cardHead(card.word, card.irregularForms) : null;
  const wordGenerated = Boolean(card?.audio.word);
  const pendingExampleCount = selectedExamples.filter((kind) => !card?.audio[kind]).length;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.formRow}>
        <Field
          style={styles.flex}
          value={word}
          onChangeText={setWord}
          placeholder="Word, jump-verb, or a phrase"
        />
        <PrimaryButton
          label={pending ? "Generating…" : "Generate"}
          loading={pending}
          disabled={!word.trim()}
          onPress={() => void onGenerate()}
        />
      </View>
      <ErrorText>{error}</ErrorText>

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Front side</Text>
        {card ? (
          <View style={styles.cardBody}>
            <View style={styles.headRow}>
              <View style={styles.flex}>
                <Text style={styles.head}>
                  {head}
                  {card.partOfSpeech ? ` (${card.partOfSpeech})` : ""}
                </Text>
                <Text style={styles.transcription}>{card.transcription}</Text>
              </View>
              {wordGenerated ? (
                <View style={styles.audioCol}>
                  <SpeakerButton url={card.audio.word} />
                  <GeneratedBadge />
                </View>
              ) : (
                <ChipButton
                  label={voiceBusy === "word" ? "Generating…" : "Generate"}
                  loading={voiceBusy === "word"}
                  disabled={voiceBusy !== null}
                  onPress={() => void generateWordVoice()}
                />
              )}
            </View>

            <View style={styles.examples}>
              {card.examples.map((example, index) => {
                const kind = EXAMPLE_KINDS[index];
                if (!kind) {
                  return null;
                }
                const generated = Boolean(card.audio[kind]);
                const selected = selectedExamples.includes(kind);
                return (
                  <View key={`${kind}-${example}`} style={styles.exampleRow}>
                    {generated ? (
                      <Text style={styles.exampleText}>
                        {index + 1}. {example}
                      </Text>
                    ) : (
                      <Pressable
                        style={styles.exampleSelect}
                        onPress={() => toggleExample(kind)}
                        disabled={voiceBusy !== null}
                      >
                        <View style={[styles.checkbox, selected && styles.checkboxOn]} />
                        <Text style={styles.exampleText}>
                          {index + 1}. {example}
                        </Text>
                      </Pressable>
                    )}
                    {generated ? (
                      <View style={styles.audioCol}>
                        <SpeakerButton url={card.audio[kind]} />
                        <GeneratedBadge />
                      </View>
                    ) : null}
                  </View>
                );
              })}
              {EXAMPLE_KINDS.some((kind) => !card.audio[kind]) ? (
                <View style={styles.exampleActions}>
                  <ChipButton
                    label={
                      voiceBusy === "examples"
                        ? "Generating…"
                        : pendingExampleCount > 1
                          ? `Generate (${pendingExampleCount})`
                          : "Generate"
                    }
                    loading={voiceBusy === "examples"}
                    disabled={voiceBusy !== null || pendingExampleCount === 0}
                    onPress={() => void generateSelectedExamples()}
                  />
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <Text style={styles.placeholder}>Enter text here.</Text>
        )}

        <View style={styles.back}>
          <Text style={styles.sectionLabel}>Back side</Text>
          {card?.definition ? (
            <Text style={styles.definition}>{card.definition}</Text>
          ) : (
            <Text style={styles.placeholder}>Enter text here.</Text>
          )}
        </View>
      </View>

      <ErrorText>{voiceError}</ErrorText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  formRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  flex: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 16,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 8,
  },
  cardBody: {
    gap: 16,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  head: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "600",
  },
  transcription: {
    color: colors.mutedStrong,
    marginTop: 4,
  },
  audioCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  examples: {
    gap: 12,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  exampleSelect: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    marginTop: 2,
  },
  checkboxOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  exampleText: {
    flex: 1,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  exampleActions: {
    alignItems: "flex-end",
  },
  back: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 16,
  },
  definition: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    lineHeight: 22,
  },
  placeholder: {
    color: "rgba(255,255,255,0.3)",
    minHeight: 72,
  },
});
