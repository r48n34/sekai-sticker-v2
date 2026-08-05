import { afterEach, describe, expect, it, vi } from "vitest";

import { loadCanvasFont } from "./fontUtils";

describe("fontUtils", () => {
    const originalFonts = document.fonts;

    afterEach(() => {
        Object.defineProperty(document, "fonts", {
            configurable: true,
            value: originalFonts,
        });
    });

    it("waits for the requested canvas font and text", async () => {
        const load = vi.fn().mockResolvedValue([]);
        Object.defineProperty(document, "fonts", {
            configurable: true,
            value: { load },
        });

        await loadCanvasFont("YurukaStd", "Wonderhoy");

        expect(load).toHaveBeenCalledWith('16px "YurukaStd"', "Wonderhoy");
    });
});
