import Konva from "konva";
import { describe, expect, it, vi } from "vitest";
import { downloadBatchZip } from "./batchExportUtils";
import { BatchDraft } from "./batchUtils";
import { ExportOptions } from "./projectUtils";
import { downloadStickerZip } from "./zipExportUtils";

vi.mock("./zipExportUtils", () => ({ downloadStickerZip: vi.fn(async () => undefined) }));

describe("batchExportUtils", () => {
    it("keeps the batch exporter API while delegating to the shared ZIP helper", async () => {
        const draft = {
            filename: "batch-item.png",
            layers: [],
        } as unknown as BatchDraft;
        const options: ExportOptions = {
            bounds: "content",
            background: null,
            pixelRatio: 2,
            filename: "batch",
        };
        const onProgress = vi.fn();

        await downloadBatchZip([{ draft, stage: {} as Konva.Stage }], options, onProgress);

        expect(downloadStickerZip).toHaveBeenCalledWith(
            [{ filename: "batch-item.png", stage: {}, layers: [] }],
            options,
            expect.stringMatching(/^sekai-sticker-batch-/u),
            onProgress,
        );
    });
});
