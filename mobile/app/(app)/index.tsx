import { router } from "expo-router";
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
import { createDeck, deleteDeck, listDecks } from "@/src/api/endpoints";
import type { DeckSummary } from "@/src/api/types";
import { ConfirmDialog } from "@/src/components/ConfirmDialog";
import {
  ErrorText,
  Field,
  LoadingBlock,
  PrimaryButton,
  SecondaryButton,
  Title,
} from "@/src/components/ui";
import { messageFromError } from "@/src/lib/format";
import { syncStudyReminder } from "@/src/notifications/study-reminder";
import { colors } from "@/src/theme";

export default function HomeScreen() {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DeckSummary | null>(null);

  const load = useCallback(async (mode: "initial" | "refresh" = "initial") => {
    setError(null);
    if (mode === "refresh") {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const result = await listDecks();
      setDecks(result.decks);
      void syncStudyReminder();
    } catch (err) {
      setError(messageFromError(err, "Could not load dictionaries."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  async function onCreate() {
    setPending(true);
    setError(null);
    try {
      const result = await createDeck(name.trim());
      setDecks((current) => [
        ...current,
        {
          id: result.deck.id,
          name: result.deck.name,
          isDefault: result.deck.isDefault ?? false,
          createdAt: result.deck.createdAt ?? new Date().toISOString(),
          cardsDueToday: result.deck.cardsDueToday ?? 0,
          cardCount: result.deck.cardCount ?? 0,
        },
      ]);
      setName("");
      setAdding(false);
    } catch (err) {
      setError(messageFromError(err, "Could not create dictionary."));
    } finally {
      setPending(false);
    }
  }

  async function onConfirmDelete() {
    if (!pendingDelete) {
      return;
    }
    setPending(true);
    setError(null);
    try {
      await deleteDeck(pendingDelete.id);
      setDecks((current) => current.filter((deck) => deck.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setError(messageFromError(err, "Could not delete dictionary."));
      setPendingDelete(null);
    } finally {
      setPending(false);
    }
  }

  if (loading) {
    return <LoadingBlock label="Loading dictionaries…" />;
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={decks}
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
            <View style={styles.headerRow}>
              <Title>Home</Title>
              {!adding ? (
                <SecondaryButton label="Add dictionary" onPress={() => setAdding(true)} />
              ) : null}
            </View>

            {adding ? (
              <View style={styles.addBox}>
                <Field
                  value={name}
                  onChangeText={setName}
                  placeholder="Dictionary name"
                  maxLength={255}
                  autoFocus
                />
                <View style={styles.addActions}>
                  <PrimaryButton
                    label={pending ? "Creating…" : "Create"}
                    loading={pending}
                    disabled={!name.trim()}
                    onPress={() => void onCreate()}
                    style={styles.flex}
                  />
                  <SecondaryButton
                    label="Cancel"
                    disabled={pending}
                    onPress={() => {
                      setAdding(false);
                      setName("");
                    }}
                    style={styles.flex}
                  />
                </View>
              </View>
            ) : null}

            <ErrorText>{error}</ErrorText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No dictionaries yet. Create one to start adding cards.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.row, index > 0 && styles.rowBorder]}>
            <Pressable
              style={({ pressed }) => [styles.rowMain, pressed && styles.pressed]}
              onPress={() => router.push(`/(app)/decks/${item.id}`)}
            >
              <View style={styles.rowText}>
                <Text style={styles.deckName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.deckMeta}>Cards for today: {item.cardsDueToday}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable
              onPress={() => setPendingDelete(item)}
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
              accessibilityLabel={`Delete dictionary ${item.name}`}
            >
              <Text style={styles.deleteIcon}>🗑</Text>
            </Pressable>
          </View>
        )}
        style={styles.list}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete dictionary?"
        description={
          pendingDelete
            ? `Delete “${pendingDelete.name}”? ${
                pendingDelete.cardCount > 0
                  ? `This removes all ${pendingDelete.cardCount} card${pendingDelete.cardCount === 1 ? "" : "s"} in it.`
                  : "This dictionary has no cards."
              } This cannot be undone.`
            : ""
        }
        confirmLabel="Delete dictionary"
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
  list: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 0,
  },
  header: {
    gap: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  addBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  addActions: {
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
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  deckName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
  },
  deckMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  chevron: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 28,
    lineHeight: 28,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteIcon: {
    fontSize: 16,
  },
  pressed: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
});
