import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router/react-navigation";
import {
  deleteAudio,
  generateAudio,
  getFlashcard,
  updateFlashcard,
} from "@/src/api/endpoints";
import type { AudioKind, Flashcard } from "@/src/api/types";
import { GeneratedBadge, SpeakerButton } from "@/src/components/SpeakerButton";
import {
  ChipButton,
  ErrorText,
  Field,
  LoadingBlock,
  PrimaryButton,
  SecondaryButton,
} from "@/src/components/ui";
import { cardHead, messageFromError, stripDuplicatePosPrefix } from "@/src/lib/format";
import { colors } from "@/src/theme";

const EXAMPLE_KINDS = ["example_1", "example_2", "example_3"] as const;

type Draft = {
  word: string;
  partOfSpeech: string;
  transcription: string;
  irregularForms: string;
  examples: [string, string, string];
  definition: string;
};

function toDraft(card: Flashcard): Draft {
  const examples = [...card.examples];
  while (examples.length < 3) {
    examples.push("");
  }
  return {
    word: card.word,
    partOfSpeech: card.partOfSpeech ?? "",
    transcription: card.transcription ?? "",
    irregularForms: card.irregularForms ?? "",
    examples: [examples[0] ?? "", examples[1] ?? "", examples[2] ?? ""],
    definition: stripDuplicatePosPrefix(card.definition, card.partOfSpeech),
  };
}

function PronunciationControls({
  url,
  busy,
  disabled,
  onGenerate,
  onRemove,
}: {
  url?: string;
  busy: boolean;
  disabled?: boolean;
  onGenerate: (force: boolean) => void;
  onRemove: () => void;
}) {
  if (url) {
    return (
      <View style={styles.audioCol}>
        <View style={styles.audioActions}>
          <SpeakerButton url={url} disabled={disabled} />
          <ChipButton label={busy ? "…" : "Regen"} loading={busy} disabled={disabled} onPress={() => onGenerate(true)} />
          <ChipButton label="Remove" disabled={busy || disabled} onPress={onRemove} />
        </View>
        <GeneratedBadge />
      </View>
    );
  }

  return (
    <ChipButton
      label={busy ? "Generating…" : "Generate audio"}
      loading={busy}
      disabled={disabled}
      onPress={() => onGenerate(false)}
    />
  );
}

export default function EditCardScreen() {
  const { id: deckId, cardId } = useLocalSearchParams<{ id: string; cardId: string }>();
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<Draft | null>(null);
  const [audio, setAudio] = useState<Partial<Record<AudioKind, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceBusy, setVoiceBusy] = useState<AudioKind | null>(null);
  const [pending, setPending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        if (!cardId) {
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const result = await getFlashcard(cardId);
          if (cancelled) {
            return;
          }
          const next = toDraft(result.card);
          setDraft(next);
          setSavedSnapshot(next);
          setAudio(result.card.audio);
        } catch (err) {
          if (!cancelled) {
            setError(messageFromError(err, "Could not load card."));
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      }
      void load();
      return () => {
        cancelled = true;
      };
    }, [cardId]),
  );

  const dirty = useMemo(
    () => Boolean(draft && savedSnapshot && JSON.stringify(draft) !== JSON.stringify(savedSnapshot)),
    [draft, savedSnapshot],
  );

  if (loading || !draft || !savedSnapshot) {
    return <LoadingBlock label="Loading card…" />;
  }

  const staleWord = draft.word.trim() !== savedSnapshot.word.trim() && Boolean(audio.word);
  const head = cardHead(draft.word.trim() || "Card", draft.irregularForms);

  async function onSave() {
    if (!cardId || !draft) {
      return;
    }
    setPending(true);
    setError(null);
    setVoiceError(null);
    const payload = {
      word: draft.word.trim(),
      partOfSpeech: draft.partOfSpeech.trim() || null,
      transcription: draft.transcription.trim(),
      irregularForms: draft.irregularForms.trim() || null,
      examples: draft.examples.map((example) => example.trim()) as [string, string, string],
      definition: draft.definition.trim(),
    };
    try {
      const result = await updateFlashcard(cardId, payload);
      const nextDraft = toDraft(result.card);
      nextDraft.definition = payload.definition;
      setDraft(nextDraft);
      setSavedSnapshot(nextDraft);
      setAudio(result.card.audio);
    } catch (err) {
      setError(messageFromError(err, "Could not save card."));
    } finally {
      setPending(false);
    }
  }

  async function generateVoice(kinds: AudioKind[], force: boolean) {
    if (!cardId) {
      return;
    }
    setVoiceBusy(kinds[0] ?? null);
    setVoiceError(null);
    try {
      const merged: Partial<Record<AudioKind, string>> = {};
      for (const kind of kinds) {
        const result = await generateAudio(cardId, kind, force);
        Object.assign(merged, result.audio);
      }
      setAudio((current) => ({ ...current, ...merged }));
    } catch (err) {
      setVoiceError(messageFromError(err, "Could not generate audio."));
    } finally {
      setVoiceBusy(null);
    }
  }

  async function removeVoice(kinds: AudioKind[]) {
    if (!cardId) {
      return;
    }
    setVoiceBusy(kinds[0] ?? null);
    setVoiceError(null);
    try {
      for (const kind of kinds) {
        await deleteAudio(cardId, kind);
      }
      setAudio((current) => {
        const next = { ...current };
        for (const kind of kinds) {
          delete next[kind];
        }
        return next;
      });
    } catch (err) {
      setVoiceError(messageFromError(err, "Could not remove audio."));
    } finally {
      setVoiceBusy(null);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: head }} />
      <View style={styles.topActions}>
        <PrimaryButton label={pending ? "Updating…" : "Update"} loading={pending} disabled={!dirty} onPress={() => void onSave()} />
        <SecondaryButton label="Back to deck" onPress={() => router.replace(`/(app)/decks/${deckId}`)} />
      </View>
      <ErrorText>{error}</ErrorText>
      {dirty ? (
        <Text style={styles.warning}>You have unsaved text changes. Save before generating pronunciation for edited lines.</Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionLabel}>Front side</Text>
        <View style={styles.fields}>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Word</Text>
            <Field value={draft.word} onChangeText={(word) => setDraft({ ...draft, word })} />
          </View>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Part of speech</Text>
            <Field
              value={draft.partOfSpeech}
              onChangeText={(partOfSpeech) => setDraft({ ...draft, partOfSpeech })}
            />
          </View>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Transcription</Text>
            <Field
              value={draft.transcription}
              onChangeText={(transcription) => setDraft({ ...draft, transcription })}
            />
          </View>
          <View style={styles.fieldBlock}>
            <Text style={styles.label}>Irregular forms</Text>
            <Field
              value={draft.irregularForms}
              onChangeText={(irregularForms) => setDraft({ ...draft, irregularForms })}
              placeholder="go/went/gone"
            />
          </View>
        </View>

        <View style={styles.wordAudioRow}>
          <Text style={styles.preview}>
            Preview: <Text style={styles.previewStrong}>{head}</Text>
            {draft.partOfSpeech.trim() ? ` (${draft.partOfSpeech.trim()})` : ""}
          </Text>
          <PronunciationControls
            url={audio.word}
            busy={voiceBusy === "word"}
            disabled={pending || draft.word.trim() !== savedSnapshot.word.trim()}
            onGenerate={(force) => void generateVoice(["word"], force)}
            onRemove={() => void removeVoice(["word"])}
          />
        </View>
        {staleWord ? <Text style={styles.warning}>Save word text first</Text> : null}

        <View style={styles.examples}>
          {draft.examples.map((example, index) => {
            const kind = EXAMPLE_KINDS[index];
            if (!kind) {
              return null;
            }
            const exampleDirty = draft.examples[index]?.trim() !== savedSnapshot.examples[index]?.trim();
            return (
              <View key={kind} style={styles.exampleBlock}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.label}>Example {index + 1}</Text>
                  {exampleDirty ? <Text style={styles.warningInline}>save text first</Text> : null}
                </View>
                <Field
                  multiline
                  value={example}
                  onChangeText={(value) => {
                    const examples = [...draft.examples] as [string, string, string];
                    examples[index] = value;
                    setDraft({ ...draft, examples });
                  }}
                />
                <View style={styles.exampleAudio}>
                  <PronunciationControls
                    url={audio[kind]}
                    busy={voiceBusy === kind}
                    disabled={pending || exampleDirty}
                    onGenerate={(force) => void generateVoice([kind], force)}
                    onRemove={() => void removeVoice([kind])}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.back}>
          <Text style={styles.sectionLabel}>Back side</Text>
          <Text style={styles.label}>Definition</Text>
          <Field
            multiline
            value={draft.definition}
            onChangeText={(definition) => setDraft({ ...draft, definition })}
          />
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
    gap: 14,
    paddingBottom: 48,
  },
  topActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  warning: {
    color: colors.warning,
    fontSize: 12,
  },
  warningInline: {
    color: colors.warning,
    fontSize: 11,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  fields: {
    gap: 12,
  },
  fieldBlock: {
    gap: 6,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
  },
  wordAudioRow: {
    gap: 10,
  },
  preview: {
    color: colors.mutedStrong,
    fontSize: 14,
  },
  previewStrong: {
    color: colors.text,
    fontWeight: "600",
  },
  audioCol: {
    alignItems: "flex-end",
    gap: 4,
  },
  audioActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  examples: {
    gap: 16,
  },
  exampleBlock: {
    gap: 8,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  exampleAudio: {
    alignItems: "flex-end",
  },
  back: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
    paddingTop: 16,
    gap: 8,
  },
});
