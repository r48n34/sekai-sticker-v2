export const MAX_SAVED_STICKERS = 60;

/**
 * Keeps the most recently saved stickers. When the limit is exceeded the
 * oldest entries are dropped so localStorage never grows past the quota.
 */
export function applySavedStickerLimit<T>(stickers: readonly T[], limit = MAX_SAVED_STICKERS): T[] {
    if (limit <= 0) {
        return [];
    }

    return stickers.length > limit ? stickers.slice(stickers.length - limit) : [...stickers];
}
