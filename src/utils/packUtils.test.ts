import { describe, expect, it, vi } from "vitest";
import { createText } from "./createSticker";
import {
    createPackItem,
    createPackItemFilename,
    createSavedStickerSourceId,
    hasSavedStickerInPack,
    MAX_PACK_ITEMS,
    movePackItem,
    normalizePackDraft,
    PackItem,
    sanitizeFilenamePart,
} from "./packUtils";

function item(id: string, sourceId?: string): PackItem {
    return {
        id,
        sourceId,
        sourceType: sourceId ? "saved" : "current",
        name: id,
        layers: [createText(id)],
        addedAt: "2026-01-01T00:00:00.000Z",
    };
}

describe("packUtils", () => {
    it("creates isolated layer snapshots", () => {
        vi.stubGlobal("crypto", { randomUUID: () => "pack-id" });
        const layers = [createText("hello")];
        const result = createPackItem("saved", " Saved sticker 1 ", layers, "saved-id");

        expect(result.name).toBe("Saved sticker 1");
        expect(result.sourceId).toBe("saved-id");
        expect(result.layers).not.toBe(layers);
        expect(result.layers[0]).not.toBe(layers[0]);
        vi.unstubAllGlobals();
    });

    it("moves items without mutating the original order", () => {
        const items = [item("one"), item("two"), item("three")];
        expect(movePackItem(items, "two", -1).map(({ id }) => id)).toEqual(["two", "one", "three"]);
        expect(items.map(({ id }) => id)).toEqual(["one", "two", "three"]);
        expect(movePackItem(items, "one", -1)).toBe(items);
    });

    it("creates stable saved-sticker IDs and detects included stickers", () => {
        const layers = [createText("one"), createText("two")];
        expect(createSavedStickerSourceId(layers)).toBe(`${layers[0].id}:${layers[1].id}`);
        expect(hasSavedStickerInPack([item("one", "saved-1")], "saved-1")).toBe(true);
        expect(hasSavedStickerInPack([item("one")], "saved-1")).toBe(false);
    });

    it("sanitizes archive and ordered item filenames", () => {
        expect(sanitizeFilenamePart("  My / Pack!? ", "fallback")).toBe("My-Pack");
        expect(sanitizeFilenamePart("///", "fallback")).toBe("fallback");
        expect(createPackItemFilename(2, "Hello / world")).toBe("03-Hello-world.png");
    });

    it("normalizes persisted drafts and enforces the item limit", () => {
        const items = Array.from({ length: MAX_PACK_ITEMS + 5 }, (_, index) => item(String(index)));
        const draft = normalizePackDraft({
            packName: "Saved pack",
            items,
            exportOptions: { bounds: "canvas", background: "#123456", pixelRatio: 3 },
        });

        expect(draft.items).toHaveLength(MAX_PACK_ITEMS);
        expect(draft.exportOptions).toMatchObject({
            bounds: "canvas",
            background: "#123456",
            pixelRatio: 3,
        });
    });

    it("falls back safely for invalid persisted state", () => {
        expect(normalizePackDraft(null)).toMatchObject({
            packName: "My sticker pack",
            items: [],
            exportOptions: { bounds: "content", background: null, pixelRatio: 2 },
        });
    });

    it("drops legacy project items during migration", () => {
        const legacyProject = { ...item("legacy"), sourceType: "project" };
        expect(normalizePackDraft({ items: [legacyProject] }).items).toEqual([]);
    });
});
