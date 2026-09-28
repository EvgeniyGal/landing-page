import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router/react-navigation";
import { getStudyQueue, reviewFlashcard } from "@/src/api/endpoints";
import type { AudioKind, Flashcard, ReviewRating } from "@/src/api/types";
import { SpeakerButton } from "@/src/components/SpeakerButton";
import { ErrorText, LoadingBlock } from "@/src/components/ui";
import { cardHead, messageFromError } from "@/src/lib/format";
import { colors } from "@/src/theme";

const EXAMPLE_KINDS: AudioKind[] = ["example_1", "example_2", "example_3"];

const RATINGS: { id: ReviewRating; label: string; bg: string; text: string }[] = [
  { id: "again", label: "Again", bg: colors.again.bg, text: colors.again.text },
  { id: "hard", label: "Hard", bg: colors.hard.bg, text: colors.hard.text },
  { id: "good", label: "Good", bg: colors.good.bg, text: colors.good.text },
  { id: "easy", label: "Easy", bg: colors.easy.bg, text: colors.easy.text },
];

export default function StudyScreen() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const [deckName, setDeckName] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      async function load() {
        if (!deckId) {
          return;
        }
        setLoading(true);
        setError(null);
        try {
          const result = await getStudyQueue(deckId);
          if (cancelled) {
            return;
          }
          setDeckName(result.deck.name);
          setCards(result.cards);
          setIndex(0);
          setRevealed(false);
        } catch (err) {
          if (!cancelled) {
            setError(messageFromError(err, "Could not load study queue."));
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
    }, [deckId]),
  );

  if (loading) {
    return <LoadingBlock label="Loading study session…" />;
  }

  const card = cards[index];
  const total = cards.length;

  if (!card) {
    return (
      <View style={styles.done}>
        <Text style={styles.doneTitle}>You are done for now</Text>
        <Text style={styles.doneSubtitle}>No more cards due in this deck.</Text>
        <Pressable style={styles.doneButton} onPress={() => router.back()}>
          <Text style={styles.doneButtonText}>Back to deck</Text>
        </Pressable>
      </View>
    );
  }

  const head = cardHead(card.word, card.irregularForms);
  const progress = ((index + (revealed ? 1 : 0)) / Math.max(total, 1)) * 100;

  async function rate(rating: ReviewRating) {
    setBusy(true);
    setError(null);
    try {
      await reviewFlashcard(card.id, rating);
      if (index + 1 >= total) {
        router.replace(`/(app)/decks/${deckId}`);
        return;
      }
      setIndex((value) => value + 1);
      setRevealed(false);
    } catch (err) {
      setError(messageFromError(err, "Could not save review."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <Text style={styles.deckName}>{deckName}</Text>
        <Text style={styles.counter}>
          {index + 1}/{total}
        </Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(progress, 8)}%` }]} />
      </View>

      <View style={styles.card}>
        <View style={styles.headRow}>
          <View style={styles.flex}>
            <Text style={styles.head}>
              {head}
              {card.partOfSpeech ? ` (${card.partOfSpeech})` : ""}
            </Text>
            <Text style={styles.transcription}>{card.transcription}</Text>
          </View>
          {card.audio.word ? <SpeakerButton url={card.audio.word} /> : null}
        </View>

        {revealed ? (
          <View style={styles.reveal}>
            {card.examples.map((example, exampleIndex) => {
              const kind = EXAMPLE_KINDS[exampleIndex];
              if (!kind) {
                return null;
              }
              const url = card.audio[kind];
              return (
                <View key={`${card.id}-${kind}`} style={styles.exampleRow}>
                  <Text style={styles.exampleText}>
                    {exampleIndex + 1}. {example}
                  </Text>
                  {url ? <SpeakerButton url={url} /> : null}
                </View>
              );
            })}
            <View style={styles.divider} />
            <Text style={styles.definition}>{card.definition}</Text>
          </View>
        ) : null}
      </View>

      <ErrorText>{error}</ErrorText>

      <View style={styles.footer}>
        {revealed ? (
          <View style={styles.ratings}>
            {RATINGS.map((rating) => (
              <Pressable
                key={rating.id}
                disabled={busy}
                onPress={() => void rate(rating.id)}
                style={({ pressed }) => [
                  styles.rating,
                  { backgroundColor: rating.bg },
                  pressed && styles.pressed,
                  busy && styles.disabled,
                ]}
              >
                <Text style={[styles.ratingLabel, { color: rating.text }]}>{rating.label}</Text>
                <Text style={[styles.ratingInterval, { color: rating.text }]}>
                  {card.intervals?.[rating.id] ?? ""}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable style={styles.revealButton} onPress={() => setRevealed(true)}>
            <Text style={styles.revealButtonText}>Tap to show answer</Text>
          </Pressable>
        )}
      </View>
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
    paddingBottom: 40,
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deckName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
  counter: {
    color: colors.mutedStrong,
    fontSize: 14,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.4)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.progress,
  },
  card: {
    minHeight: 280,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.parchment,
    padding: 24,
    gap: 16,
  },
  headRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  head: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "600",
  },
  transcription: {
    color: colors.mutedStrong,
    marginTop: 8,
  },
  reveal: {
    gap: 14,
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  exampleText: {
    flex: 1,
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  definition: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    marginTop: 8,
    alignItems: "center",
  },
  ratings: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  rating: {
    width: "47%",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  ratingInterval: {
    fontSize: 11,
    opacity: 0.8,
    marginTop: 2,
  },
  revealButton: {
    backgroundColor: colors.text,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  revealButtonText: {
    color: "#000",
    fontWeight: "700",
    fontSize: 14,
  },
  done: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  doneTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "600",
  },
  doneSubtitle: {
    color: colors.muted,
    fontSize: 15,
  },
  doneButton: {
    marginTop: 16,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  doneButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.55,
  },
});
