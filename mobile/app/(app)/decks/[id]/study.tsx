import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router/react-navigation";
import { getStudyQueue, reviewFlashcard } from "@/src/api/endpoints";
import type { AudioKind, Flashcard, ReviewRating } from "@/src/api/types";
import { useLazyEye } from "@/src/anaglyph/LazyEyeContext";
import { DichopticRatingButton } from "@/src/components/anaglyph/DichopticRatingButton";
import { DichopticText } from "@/src/components/anaglyph/DichopticText";
import { SpeakerButton } from "@/src/components/SpeakerButton";
import { ErrorText, LoadingBlock } from "@/src/components/ui";
import { backgroundCss, neutralForeground } from "@/src/lib/anaglyph/color";
import { cardHead, messageFromError } from "@/src/lib/format";
import {
  advanceStudyQueue,
  dueTimestamp,
  formatWaitLabel,
  splitDueQueue,
} from "@/src/lib/study-queue";
import { syncStudyReminder } from "@/src/notifications/study-reminder";
import { colors } from "@/src/theme";

const EXAMPLE_KINDS: AudioKind[] = ["example_1", "example_2", "example_3"];

type RevealStep = "front" | "examples" | "answer";

const STEP_PROGRESS: Record<RevealStep, number> = {
  front: 0,
  examples: 0.5,
  answer: 1,
};

const RATINGS: { id: ReviewRating; label: string; bg: string; text: string }[] = [
  { id: "again", label: "Again", bg: colors.again.bg, text: colors.again.text },
  { id: "hard", label: "Hard", bg: colors.hard.bg, text: colors.hard.text },
  { id: "good", label: "Good", bg: colors.good.bg, text: colors.good.text },
  { id: "easy", label: "Easy", bg: colors.easy.bg, text: colors.easy.text },
];

function nextStep(step: RevealStep): RevealStep {
  if (step === "front") {
    return "examples";
  }
  if (step === "examples") {
    return "answer";
  }
  return "answer";
}

export default function StudyScreen() {
  const { id: deckId } = useLocalSearchParams<{ id: string }>();
  const {
    lazyEyeEnabled,
    activeProfile,
    wordTextScale,
    exampleTextScale,
    explanationTextScale,
  } = useLazyEye();
  const [deckName, setDeckName] = useState("");
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [initialCount, setInitialCount] = useState(0);
  const [step, setStep] = useState<RevealStep>("front");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const dichoptic = lazyEyeEnabled && activeProfile;
  const anaglyphColors = dichoptic
    ? {
        leftHue: activeProfile.leftHue,
        leftLightness: activeProfile.leftLightness,
        rightHue: activeProfile.rightHue,
        rightLightness: activeProfile.rightLightness,
      }
    : null;
  const surfaceBg = dichoptic ? backgroundCss(activeProfile.background) : colors.bg;
  const surfaceFg = dichoptic ? neutralForeground(activeProfile.background) : colors.text;

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
          setQueue(result.cards);
          setInitialCount(result.cards.length);
          setStep("front");
          setNow(Date.now());
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

  const { due, waiting } = splitDueQueue(queue, now);
  const card = due[0];
  const nextWaiting = waiting[0];
  const remainingCount = queue.length;

  useEffect(() => {
    if (card || !nextWaiting) {
      return;
    }
    const delay = Math.max(250, dueTimestamp(nextWaiting.dueAt) - Date.now());
    const timer = setTimeout(() => setNow(Date.now()), delay);
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, [card, nextWaiting]);

  if (loading) {
    return <LoadingBlock label="Loading study session…" />;
  }

  if (!card && !nextWaiting) {
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

  if (!card && nextWaiting) {
    const waitMs = Math.max(0, dueTimestamp(nextWaiting.dueAt) - now);
    return (
      <View style={styles.done}>
        <Text style={styles.doneTitle}>Next card in {formatWaitLabel(waitMs)}</Text>
        <Text style={styles.doneSubtitle}>
          Learning step for “{cardHead(nextWaiting.word, nextWaiting.irregularForms)}”
        </Text>
        <Text style={styles.waitingMeta}>
          {remainingCount} card{remainingCount === 1 ? "" : "s"} left in this session
        </Text>
        <ErrorText>{error}</ErrorText>
      </View>
    );
  }

  const head = cardHead(card.word, card.irregularForms);
  const reviewed = initialCount - remainingCount;
  const progress = ((reviewed + STEP_PROGRESS[step]) / Math.max(initialCount, 1)) * 100;
  const showExamples = step === "examples" || step === "answer";
  const showAnswer = step === "answer";
  const titleText = `${head}${card.partOfSpeech ? ` (${card.partOfSpeech})` : ""}`;
  const headStyle = { ...styles.head, fontSize: 28 * wordTextScale };
  const exampleStyle = {
    ...styles.exampleText,
    fontSize: 15 * exampleTextScale,
    lineHeight: 22 * exampleTextScale,
  };
  const definitionStyle = {
    ...styles.definition,
    fontSize: 15 * explanationTextScale,
    lineHeight: 22 * explanationTextScale,
  };

  function advanceReveal() {
    setStep((current) => nextStep(current));
  }

  async function rate(rating: ReviewRating) {
    setBusy(true);
    setError(null);
    try {
      const result = await reviewFlashcard(card.id, rating);
      const updated: Flashcard = {
        ...card,
        state: result.card.state,
        dueAt: result.card.dueAt,
        ease: result.card.ease,
        intervalDays: result.card.intervalDays,
        intervals: result.card.intervals ?? card.intervals,
      };
      const nextQueue = advanceStudyQueue(queue, updated);
      setQueue(nextQueue);
      setStep("front");
      setNow(Date.now());
      void syncStudyReminder();
      if (nextQueue.length === 0) {
        router.replace(`/(app)/decks/${deckId}`);
      }
    } catch (err) {
      setError(messageFromError(err, "Could not save review."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: surfaceBg }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.topRow}>
        <Text style={[styles.deckName, { color: surfaceFg }]}>{deckName}</Text>
        <Text style={[styles.counter, { color: surfaceFg, opacity: 0.7 }]}>{remainingCount} left</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(progress, 8)}%` }]} />
      </View>

      <Pressable
        disabled={showAnswer}
        onPress={advanceReveal}
        style={({ pressed }) => [
          styles.card,
          dichoptic && { backgroundColor: surfaceBg },
          !showAnswer && pressed && styles.pressed,
        ]}
      >
        <View style={styles.headRow}>
          <View style={styles.flex}>
            {anaglyphColors ? (
              <DichopticText
                text={titleText}
                colors={anaglyphColors}
                mode="letters"
                neutralColor={surfaceFg}
                style={headStyle}
              />
            ) : (
              <Text style={headStyle}>{titleText}</Text>
            )}
            {anaglyphColors && card.transcription ? (
              <DichopticText
                text={card.transcription}
                colors={anaglyphColors}
                mode="letters"
                neutralColor={surfaceFg}
                style={styles.transcription}
              />
            ) : (
              <Text style={styles.transcription}>{card.transcription}</Text>
            )}
          </View>
          {card.audio.word ? <SpeakerButton url={card.audio.word} /> : null}
        </View>

        {showExamples ? (
          <View style={styles.reveal}>
            {card.examples.map((example, exampleIndex) => {
              const kind = EXAMPLE_KINDS[exampleIndex];
              if (!kind) {
                return null;
              }
              const url = card.audio[kind];
              return (
                <View key={`${card.id}-${kind}`} style={styles.exampleRow}>
                  {anaglyphColors ? (
                    <DichopticText
                      text={`${exampleIndex + 1}. ${example}`}
                      colors={anaglyphColors}
                      mode="syllables"
                      neutralColor={surfaceFg}
                      style={exampleStyle}
                    />
                  ) : (
                    <Text style={exampleStyle}>
                      {exampleIndex + 1}. {example}
                    </Text>
                  )}
                  {url ? <SpeakerButton url={url} /> : null}
                </View>
              );
            })}
            {showAnswer ? (
              <>
                <View style={styles.divider} />
                {anaglyphColors && card.definition ? (
                  <DichopticText
                    text={card.definition}
                    colors={anaglyphColors}
                    mode="syllables"
                    neutralColor={surfaceFg}
                    style={definitionStyle}
                  />
                ) : (
                  <Text style={definitionStyle}>{card.definition}</Text>
                )}
              </>
            ) : null}
          </View>
        ) : null}
      </Pressable>

      <ErrorText>{error}</ErrorText>

      <View style={styles.footer}>
        {showAnswer ? (
          <View style={styles.ratings}>
            {RATINGS.map((rating, index) =>
              anaglyphColors ? (
                <DichopticRatingButton
                  key={rating.id}
                  label={rating.label}
                  interval={card.intervals?.[rating.id]}
                  colors={anaglyphColors}
                  invert={index % 2 === 1}
                  disabled={busy}
                  onPress={() => void rate(rating.id)}
                />
              ) : (
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
              ),
            )}
          </View>
        ) : (
          <Pressable style={styles.revealButton} onPress={advanceReveal}>
            <Text style={styles.revealButtonText}>
              {step === "front" ? "Tap to show examples" : "Tap to show answer"}
            </Text>
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
    textAlign: "center",
  },
  waitingMeta: {
    color: colors.mutedStrong,
    fontSize: 13,
    marginTop: 8,
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
