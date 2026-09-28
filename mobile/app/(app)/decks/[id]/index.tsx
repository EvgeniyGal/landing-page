import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router/react-navigation";
import { deleteFlashcard, getDeck } from "@/src/api/endpoints";
import type { Flashcard } from "@/src/api/types";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { SpeakerButton } from "@/src/components/SpeakerButton";
import {
  ErrorText,
  LoadingBlock,
  PrimaryButton,
  SecondaryButton,
} from "@/src/components/ui";
import { cardHead, messageFromError, stateMeta } from "@/src/lib/format";
import { colors } from "@/src/theme";

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deckName, setDeckName] = useState("Dictionary");
  const [counts, setCounts] = useState({ new: 0, learning: 0, review: 0, due: 0 });
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Flashcard | null>(null);

  const load = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!id) {
        return;
      }
      setError(null);
      if (mode === "refresh") {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const result = await getDeck(id);
        setDeckName(result.deck.name);
        setCounts(result.counts);
        setCards(result.cards);
      } catch (err) {
        setError(messageFromError(err, "Could not load deck."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onConfirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await deleteFlashcard(pendingDelete.id);
      setCards((current) => current.filter((card) => card.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setError(messageFromError(err, "Could not delete card."));
      setPendingDelete(null);
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading deck…" />;
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: deckName }} />
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load("refresh")}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>{deckName}</Text>
            <Text style={styles.meta}>
              Due {counts.due} · New {counts.new} · Learning {counts.learning} · Review {counts.review}
            </Text>
            <View style={styles.actions}>
              <PrimaryButton
                label="Study"
                disabled={counts.due === 0}
                onPress={() => router.push(`/(app)/decks/${id}/study`)}
                style={styles.flex}
              />
              <SecondaryButton
                label="Add card"
                onPress={() => router.push(`/(app)/decks/${id}/add`)}
                style={styles.flex}
              />
            </View>
            <ErrorText>{error}</ErrorText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cards in this deck yet.</Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const state = stateMeta(item.state);
          return (
            <View style={[styles.row, index > 0 && styles.rowBorder]}>
              <Pressable
                style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
                onPress={() => router.push(`/(app)/decks/${id}/cards/${item.id}`)}
              >
                <View style={styles.rowText}>
                  <Text style={styles.word} numberOfLines={1}>
                    {cardHead(item.word, item.irregularForms)}
                  </Text>
                  <Text style={styles.definition} numberOfLines={1}>
                    {item.definition}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: state.bg }]}>
                  <Text style={[styles.badgeText, { color: state.text }]}>{state.label}</Text>
                </View>
              </Pressable>
              {item.audio.word ? <SpeakerButton url={item.audio.word} /> : null}
              <Pressable
                onPress={() => setPendingDelete(item)}
                style={styles.deleteBtn}
                accessibilityLabel={`Delete ${item.word}`}
              >
                <Text style={styles.deleteIcon}>🗑</Text>
              </Pressable>
            </View>
          );
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete card?"
        description={
          pendingDelete
            ? `Delete “${cardHead(pendingDelete.word, pendingDelete.irregularForms)}”? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete card"
        pending={pending}
        onCancel={() => {
          if (!pending) {
            setPendingDelete(null);
          }
        }}
        onConfirm={() => void onConfirmDelete()}
      />
    </View>
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
  },
  header: {
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "600",
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 0,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  word: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  definition: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    fontSize: 15,
  },
  pressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});
