import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  createFlashcardFromContent,
  deleteFlashcard,
  generateAudio,
  previewFlashcard,
} from "@/src/api/endpoints";
import type { Flashcard, FlashcardWrite } from "@/src/api/types";
import { GeneratedBadge, SpeakerButton } from "@/src/components/SpeakerButton";
import {
  ChipButton,
  ErrorText,
  Field,
  PrimaryButton,
  SecondaryButton,
} from "@/src/components/ui";
import { cardHead, messageFromError } from "@/src/lib/format";
import { colors } from "@/src/theme";

const EXAMPLE_KINDS = ["example_1", "example_2", "example_3"] as const;
type AudioKindKey = "word" | (typeof EXAMPLE_KINDS)[number];

export default function AddCardScreen() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const [word, setWord] = useState("");
  const [pending, setPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<FlashcardWrite | null>(null);
  const [inputText, setInputText] = useState("");
  const [saved, setSaved] = useState<Flashcard | null>(null);
  const [voiceBusy, setVoiceBusy] = useState<AudioKindKey | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const display = saved
    ? {
        word: saved.word,
        partOfSpeech: saved.partOfSpeech,
        transcription: saved.transcription,
        irregularForms: saved.irregularForms,
        examples: saved.examples,
        definition: saved.definition,
      }
    : preview;

  async function discardWorkingCard() {
    if (!saved) {
      return;
    }
    try {
      await deleteFlashcard(saved.id);
    } catch {
      // Best-effort cleanup of an unconfirmed working card.
    }
    setSaved(null);
  }

  async function onGenerate() {
    if (!deckId) {
      return;
    }
    setPending(true);
    setError(null);
    setVoiceError(null);
    try {
      await discardWorkingCard();
      const result = await previewFlashcard(word.trim());
      setPreview(result.card);
      setInputText(result.inputText);
      setWord("");
    } catch (err) {
      setError(messageFromError(err, "Could not generate a flashcard."));
    } finally {
      setPending(false);
    }
  }

  async function ensureSavedCard(): Promise<Flashcard | null> {
    if (saved) {
      return saved;
    }
    if (!preview || !deckId) {
      return null;
    }
    try {
      const result = await createFlashcardFromContent(inputText || preview.word, preview, deckId);
      setSaved(result.card);
      return result.card;
    } catch (err) {
      setError(messageFromError(err, "Could not save the flashcard."));
      return null;
    }
  }

  async function onAddCard() {
    if (!display) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (!saved) {
        const created = await ensureSavedCard();
        if (!created) {
          return;
        }
      }
      setPreview(null);
      setSaved(null);
      setInputText("");
      setWord("");
      setVoiceError(null);
    } finally {
      setSaving(false);
    }
  }

  async function generateVoice(kind: AudioKindKey) {
    setVoiceBusy(kind);
    setVoiceError(null);
    setError(null);
    try {
      const card = await ensureSavedCard();
      if (!card) {
        return;
      }
      const result = await generateAudio(card.id, kind);
      setSaved((current) =>
        current ? { ...current, audio: { ...current.audio, ...result.audio } } : current,
      );
    } catch (err) {
      setVoiceError(messageFromError(err, "Could not generate audio."));
    } finally {
      setVoiceBusy(null);
    }
  }

  const head = display ? cardHead(display.word, display.irregularForms) : null;
  const wordGenerated = Boolean(saved?.audio.word);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SecondaryButton label="Back to deck" onPress={() => router.replace(`/(app)/decks/${deckId}`)} />
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
        {display ? (
          <View style={styles.cardBody}>
            <View style={styles.headRow}>
              <View style={styles.flex}>
                <Text style={styles.head}>
                  {head}
                  {display.partOfSpeech ? ` (${display.partOfSpeech})` : ""}
                </Text>
                <Text style={styles.transcription}>{display.transcription}</Text>
              </View>
              {wordGenerated && saved?.audio.word ? (
                <View style={styles.audioCol}>
                  <SpeakerButton url={saved.audio.word} />
                  <GeneratedBadge />
                </View>
              ) : (
                <ChipButton
                  label={voiceBusy === "word" ? "Generating…" : "Generate audio"}
                  loading={voiceBusy === "word"}
                  disabled={voiceBusy !== null || saving}
                  onPress={() => void generateVoice("word")}
                />
              )}
            </View>

            <View style={styles.examples}>
              {display.examples.map((example, index) => {
                const kind = EXAMPLE_KINDS[index];
                if (!kind) {
                  return null;
                }
                const generated = Boolean(saved?.audio[kind]);
                return (
                  <View key={`${kind}-${example}`} style={styles.exampleRow}>
                    <Text style={styles.exampleText}>
                      {index + 1}. {example}
                    </Text>
                    {generated && saved?.audio[kind] ? (
                      <View style={styles.audioCol}>
                        <SpeakerButton url={saved.audio[kind]} />
                        <GeneratedBadge />
                      </View>
                    ) : (
                      <ChipButton
                        label={voiceBusy === kind ? "Generating…" : "Generate audio"}
                        loading={voiceBusy === kind}
                        disabled={voiceBusy !== null || saving}
                        onPress={() => void generateVoice(kind)}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <Text style={styles.placeholder}>Enter text here.</Text>
        )}

        <View style={styles.back}>
          <Text style={styles.sectionLabel}>Back side</Text>
          {display?.definition ? (
            <Text style={styles.definition}>{display.definition}</Text>
          ) : (
            <Text style={styles.placeholder}>Enter text here.</Text>
          )}
        </View>
      </View>

      {display ? (
        <PrimaryButton
          label={saving ? "Saving…" : "Add card"}
          loading={saving}
          disabled={voiceBusy !== null}
          onPress={() => void onAddCard()}
        />
      ) : null}

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
  exampleText: {
    flex: 1,
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
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
