import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import type { DeckCardPagination, DeckCounts, Flashcard } from "@/src/api/types";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import { SpeakerButton } from "@/src/components/SpeakerButton";
import {
  ChipButton,
  ErrorText,
  Field,
  LoadingBlock,
  PrimaryButton,
  SecondaryButton,
} from "@/src/components/ui";
import {
  DEFAULT_DECK_CARD_PAGE_SIZE,
  DECK_CARD_PAGE_SIZES,
  type DeckCardPageSize,
} from "@/src/lib/deck-cards";
import { cardHead, messageFromError, stateMeta } from "@/src/lib/format";
import { formatDueLabel } from "@/src/lib/study-queue";
import { colors } from "@/src/theme";

const EMPTY_PAGINATION: DeckCardPagination = {
  page: 1,
  pageSize: DEFAULT_DECK_CARD_PAGE_SIZE,
  total: 0,
  totalPages: 1,
  search: "",
};

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [deckName, setDeckName] = useState("Dictionary");
  const [counts, setCounts] = useState<DeckCounts>({ new: 0, learning: 0, review: 0, due: 0 });
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [pagination, setPagination] = useState<DeckCardPagination>(EMPTY_PAGINATION);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<DeckCardPageSize>(DEFAULT_DECK_CARD_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Flashcard | null>(null);

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) {
      return;
    }
    const handle = setTimeout(() => {
      setSearch(trimmed);
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput, search]);

  const load = useCallback(
    async (mode: "initial" | "refresh" | "silent" = "initial") => {
      if (!id) {
        return;
      }
      setError(null);
      if (mode === "refresh") {
        setRefreshing(true);
      } else if (mode === "initial") {
        setLoading(true);
      }
      try {
        const result = await getDeck(id, { q: search || undefined, page, pageSize });
        setDeckName(result.deck.name);
        setCounts(result.counts);
        setCards(result.cards);
        setPagination(
          result.pagination ?? {
            page,
            pageSize,
            total: result.cards.length,
            totalPages: 1,
            search,
          },
        );
      } catch (err) {
        setError(messageFromError(err, "Could not load deck."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, search, page, pageSize],
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
      setPendingDelete(null);
      if (cards.length <= 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await load("silent");
      }
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

  const from = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const to = Math.min(pagination.page * pagination.pageSize, pagination.total);
  const emptyMessage = search ? `No cards match “${search}”.` : "No cards in this deck yet.";

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: deckName }} />
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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

            <Field
              value={searchInput}
              onChangeText={setSearchInput}
              placeholder="Search words…"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />

            <View style={styles.pageSizeRow}>
              <Text style={styles.pageSizeLabel}>Per page</Text>
              <View style={styles.pageSizeChips}>
                {DECK_CARD_PAGE_SIZES.map((size) => (
                  <ChipButton
                    key={size}
                    label={String(size)}
                    onPress={() => {
                      setPageSize(size);
                      setPage(1);
                    }}
                    style={pageSize === size ? styles.pageSizeActive : undefined}
                  />
                ))}
              </View>
            </View>

            <ErrorText>{error}</ErrorText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.footerMeta}>
              {pagination.total === 0 ? "0 cards" : `Showing ${from}–${to} of ${pagination.total}`}
            </Text>
            <View style={styles.pager}>
              <SecondaryButton
                label="Prev"
                disabled={pagination.page <= 1}
                onPress={() => setPage((current) => Math.max(1, current - 1))}
                style={styles.pagerBtn}
              />
              <Text style={styles.pageIndicator}>
                {pagination.page} / {pagination.totalPages}
              </Text>
              <SecondaryButton
                label="Next"
                disabled={pagination.page >= pagination.totalPages}
                onPress={() => setPage((current) => current + 1)}
                style={styles.pagerBtn}
              />
            </View>
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
                <View style={styles.metaCol}>
                  <View style={[styles.badge, { backgroundColor: state.bg }]}>
                    <Text style={[styles.badgeText, { color: state.text }]}>{state.label}</Text>
                  </View>
                  <Text style={styles.dueLabel}>{formatDueLabel(item.dueAt)}</Text>
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
  pageSizeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pageSizeLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  pageSizeChips: {
    flexDirection: "row",
    gap: 8,
  },
  pageSizeActive: {
    borderColor: colors.accent,
    backgroundColor: "rgba(61,139,255,0.15)",
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
  footer: {
    marginTop: 16,
    gap: 12,
  },
  footerMeta: {
    color: colors.muted,
    fontSize: 13,
  },
  pager: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pagerBtn: {
    flex: 1,
    minHeight: 44,
  },
  pageIndicator: {
    color: colors.mutedStrong,
    fontSize: 13,
    minWidth: 56,
    textAlign: "center",
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
  metaCol: {
    alignItems: "flex-end",
    gap: 4,
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
  dueLabel: {
    color: colors.muted,
    fontSize: 11,
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
