export const DECK_CARD_PAGE_SIZES = [20, 50, 100] as const;
export type DeckCardPageSize = (typeof DECK_CARD_PAGE_SIZES)[number];
export const DEFAULT_DECK_CARD_PAGE_SIZE: DeckCardPageSize = 20;
