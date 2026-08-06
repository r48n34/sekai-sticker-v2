import { describe, expect, it } from "vitest";
import { chatactorList } from "../data/characters";
import {
    BATCH_TEXT_SAFE_WIDTH,
    BatchStyleOptions,
    createBatchDrafts,
    DEFAULT_BATCH_TEXT_X,
    DEFAULT_BATCH_TEXT_Y,
    fitBatchFontSize,
    MAX_BATCH_PHRASES,
    MIN_BATCH_FONT_SIZE,
    parseBatchPhrases,
    sanitizeBatchFilename,
} from "./batchUtils";

const style: BatchStyleOptions = {
    fontFamily: "YurukaStd",
    maxFontSize: 42,
    fill: "#123456",
    stroke: "#ffffff",
    strokeWidth: 8,
    rotation: 12,
    textX: DEFAULT_BATCH_TEXT_X + 15,
    textY: DEFAULT_BATCH_TEXT_Y + 20,
};

describe("batchUtils", () => {
    it("parses trimmed non-empty lines while preserving order and duplicates", () => {
        expect(parseBatchPhrases(" Hello \n\nThanks\r\nHello ")).toEqual([
            "Hello",
            "Thanks",
            "Hello",
        ]);
    });

    it("keeps phrase counts visible beyond the maximum for blocking validation", () => {
        const input = Array.from({ length: MAX_BATCH_PHRASES + 1 }, (_, index) => `Line ${index}`);
        expect(parseBatchPhrases(input.join("\n"))).toHaveLength(MAX_BATCH_PHRASES + 1);
    });

    it("creates unique, ordered filenames including Unicode text", () => {
        expect(sanitizeBatchFilename("Hello, Sekai!", 0)).toBe("01-hello-sekai.png");
        expect(sanitizeBatchFilename("ありがとう", 1)).toBe("02-ありがとう.png");
        expect(sanitizeBatchFilename("🎉", 2)).toBe("03-sticker.png");
    });

    it("uses the maximum font size when the phrase fits", () => {
        expect(fitBatchFontSize("Short", style, () => 100)).toBe(style.maxFontSize);
    });

    it("shrinks text until it fits with its stroke", () => {
        const measuredAt = (fontSize: number) =>
            BATCH_TEXT_SAFE_WIDTH - style.strokeWidth * 2 + (fontSize - 30) * 10;
        expect(fitBatchFontSize("Long", style, (_, __, size) => measuredAt(size))).toBe(30);
    });

    it("rejects text that cannot fit at the minimum font size", () => {
        expect(
            fitBatchFontSize(
                "Far too long",
                style,
                () => BATCH_TEXT_SAFE_WIDTH + style.strokeWidth * 2 + 1,
            ),
        ).toBeNull();
    });

    it("creates independent styled layers and marks unfit drafts", () => {
        const drafts = createBatchDrafts(
            chatactorList[0],
            ["First", "Second"],
            { width: 200, height: 180 },
            style,
            (text) => (text === "First" ? 100 : 1000),
        );

        expect(drafts).toHaveLength(2);
        expect(drafts[0].layers[0]).toMatchObject({
            content: chatactorList[0].img,
            width: 200,
            height: 180,
        });
        expect(drafts[0].layers[1]).toMatchObject({
            content: "First",
            fill: style.fill,
            stroke: style.stroke,
            rotation: style.rotation,
            x: style.textX,
            y: style.textY,
        });
        expect(drafts[0].layers[0].id).not.toBe(drafts[1].layers[0].id);
        expect(drafts[0].layers[1].id).not.toBe(drafts[1].layers[1].id);
        expect(drafts[0].valid).toBe(true);
        expect(drafts[1]).toMatchObject({
            valid: false,
            error: "text-too-wide",
            fontSize: MIN_BATCH_FONT_SIZE,
        });
    });
});
