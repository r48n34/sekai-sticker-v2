import { afterEach, describe, expect, it, vi } from "vitest";

import { dataURLToBlob, downloadFile, timer } from "./downloadUtils";

describe("downloadUtils", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("timer resolves after delay", async () => {
        vi.useFakeTimers();
        const p = timer(10);
        await vi.advanceTimersByTimeAsync(10);
        await expect(p).resolves.toBeUndefined();
        vi.useRealTimers();
    });

    it("downloadFile creates a temporary anchor and clicks it", () => {
        const click = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => undefined);
        const appendSpy = vi.spyOn(document.body, "appendChild");
        const removeSpy = vi.spyOn(document.body, "removeChild");

        downloadFile("data:image/png;base64,abc", "sticker.png");
        expect(appendSpy).toHaveBeenCalledOnce();
        expect(click).toHaveBeenCalledOnce();
        expect(removeSpy).toHaveBeenCalledOnce();
    });

    it("dataURLToBlob fetches and returns a blob", async () => {
        const blob = new Blob(["abc"], { type: "text/plain" });
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                blob: vi.fn().mockResolvedValue(blob),
            }),
        );

        const result = await dataURLToBlob("data:text/plain;base64,YWJj");
        expect(result).toBe(blob);
    });
});
