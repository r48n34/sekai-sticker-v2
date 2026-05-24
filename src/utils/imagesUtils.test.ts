import { describe, expect, it, vi } from "vitest";

import { getImagesWidthAndHeight } from "./imagesUtils";

class MockImage {
    public static nextWidth = 0;
    public static nextHeight = 0;
    public static shouldError = false;
    public static lastSrc = "";
    public onload: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public naturalWidth = 0;
    public naturalHeight = 0;

    set src(value: string) {
        MockImage.lastSrc = value;
        this.naturalWidth = MockImage.nextWidth;
        this.naturalHeight = MockImage.nextHeight;

        if (MockImage.shouldError) {
            this.onerror?.();
            return;
        }

        this.onload?.();
    }
}

describe("imagesUtils", () => {
    it("resolves image width and height on successful load", async () => {
        MockImage.nextWidth = 321;
        MockImage.nextHeight = 123;
        MockImage.shouldError = false;
        MockImage.lastSrc = "";
        vi.stubGlobal("Image", MockImage as unknown as typeof Image);

        const result = await getImagesWidthAndHeight("img/test.png");
        expect(result).toEqual({ w: 321, h: 123 });
        expect(MockImage.lastSrc).toBe("img/test.png");
    });

    it("rejects when image load fails", async () => {
        MockImage.nextWidth = 0;
        MockImage.nextHeight = 0;
        MockImage.shouldError = true;
        MockImage.lastSrc = "";
        vi.stubGlobal("Image", MockImage as unknown as typeof Image);

        await expect(getImagesWidthAndHeight("img/broken.png")).rejects.toBe(
            "There was some problem with the image.",
        );
        expect(MockImage.lastSrc).toBe("img/broken.png");
    });
});
