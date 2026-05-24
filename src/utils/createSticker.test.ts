import { describe, expect, it, vi } from "vitest";

import {
    CONFIGS,
    capitalizeFirstLetter,
    createExternalImages,
    createImages,
    createImagesInit,
    createText,
    duplicateNewObject,
    type StickerObject,
} from "./createSticker";
import * as imagesUtils from "./imagesUtils";

describe("createSticker utils", () => {
    it("createText returns default style and provided content", () => {
        const result = createText("Sekai", "#123456");
        expect(result.format).toBe("text");
        expect(result.content).toBe("Sekai");
        expect(result.fill).toBe("#123456");
        expect(result.x).toBe(CONFIGS.initialTextX);
        expect(result.y).toBe(CONFIGS.initialTextY);
        expect(result.id).toMatch(/^[a-f0-9-]+$/);
    });

    it("createImages uses image dimensions", async () => {
        vi.spyOn(imagesUtils, "getImagesWidthAndHeight").mockResolvedValue({ w: 120, h: 90 });
        const result = await createImages("img/A.png");
        expect(result.format).toBe("image");
        expect(result.width).toBe(120);
        expect(result.height).toBe(90);
        expect(result.content).toBe("img/A.png");
    });

    it("createExternalImages scales down oversize images", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
        vi.spyOn(imagesUtils, "getImagesWidthAndHeight").mockResolvedValue({ w: 900, h: 600 });
        const result = await createExternalImages("img/B.png");
        expect(result.format).toBe("externalImage");
        expect(result.width).toBe(100);
        expect(result.height).toBeCloseTo(66.6666666667);
    });

    it("createImagesInit preserves provided width and height", () => {
        const result = createImagesInit("img/C.png", 40, 60);
        expect(result.format).toBe("image");
        expect(result.width).toBe(40);
        expect(result.height).toBe(60);
    });

    it("duplicateNewObject offsets position and regenerates id", () => {
        const base: StickerObject = {
            x: 30,
            y: 50,
            format: "text",
            content: "A",
            id: "aaaaaaaaaaaaaaaaaaaa",
        };
        const duplicated = duplicateNewObject(base);
        expect(duplicated.x).toBe(15);
        expect(duplicated.y).toBe(35);
        expect(duplicated.id).not.toBe(base.id);
    });

    it("capitalizeFirstLetter uppercases only first character", () => {
        expect(capitalizeFirstLetter("sekai")).toBe("Sekai");
        expect(capitalizeFirstLetter("")).toBe("");
        expect(capitalizeFirstLetter("1abc")).toBe("1abc");
    });
});
