import { describe, expect, it, vi } from "vitest";

import { copyImages } from "./copyUtils";

class MockClipboardItem {
    public readonly payload: Record<string, Blob>;

    constructor(payload: Record<string, Blob>) {
        this.payload = payload;
    }
}

describe("copyUtils", () => {
    it("calls clipboard.write once with default image/png format", () => {
        const writeMock = vi.fn();
        Object.defineProperty(globalThis.navigator, "clipboard", {
            value: { write: writeMock },
            configurable: true,
        });

        vi.stubGlobal("ClipboardItem", MockClipboardItem as unknown as typeof ClipboardItem);

        const blob = new Blob(["png"], { type: "image/png" });
        copyImages(blob);

        expect(writeMock).toHaveBeenCalledOnce();
        const [[items]] = writeMock.mock.calls as [[MockClipboardItem[]]];
        expect(items).toHaveLength(1);
        expect(items[0]).toBeInstanceOf(MockClipboardItem);
        expect(items[0].payload).toEqual({ "image/png": blob });
    });

    it("uses provided custom mime format", () => {
        const writeMock = vi.fn();
        Object.defineProperty(globalThis.navigator, "clipboard", {
            value: { write: writeMock },
            configurable: true,
        });

        vi.stubGlobal("ClipboardItem", MockClipboardItem as unknown as typeof ClipboardItem);

        const blob = new Blob(["webp"], { type: "image/webp" });
        copyImages(blob, "image/webp");

        expect(writeMock).toHaveBeenCalledOnce();
        const [[items]] = writeMock.mock.calls as [[MockClipboardItem[]]];
        expect(items).toHaveLength(1);
        expect(items[0]).toBeInstanceOf(MockClipboardItem);
        expect(items[0].payload).toEqual({ "image/webp": blob });
    });
});
