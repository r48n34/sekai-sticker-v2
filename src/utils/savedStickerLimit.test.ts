import { describe, expect, it } from "vitest";
import { applySavedStickerLimit, MAX_SAVED_STICKERS } from "./savedStickerLimit";

function range(length: number): number[] {
    return Array.from({ length }, (_, index) => index);
}

describe("savedStickerLimit", () => {
    it("keeps every sticker while under the limit", () => {
        const stickers = range(3);

        expect(applySavedStickerLimit(stickers, 5)).toEqual([0, 1, 2]);
    });

    it("drops the oldest stickers when over the limit", () => {
        const stickers = range(5);

        expect(applySavedStickerLimit(stickers, 3)).toEqual([2, 3, 4]);
    });

    it("returns a copy so callers cannot mutate the store input", () => {
        const stickers = range(2);
        const result = applySavedStickerLimit(stickers, 5);

        result.push(9);

        expect(stickers).toEqual([0, 1]);
    });

    it("uses the default limit", () => {
        const result = applySavedStickerLimit(range(MAX_SAVED_STICKERS + 2));

        expect(result).toHaveLength(MAX_SAVED_STICKERS);
        expect(result[0]).toBe(2);
    });

    it("returns an empty list for non-positive limits", () => {
        expect(applySavedStickerLimit(range(3), 0)).toEqual([]);
    });
});
