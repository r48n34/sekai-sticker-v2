import JSZip from "jszip";
import Konva from "konva";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dataURLToBlob, downloadBlob } from "./downloadUtils";
import { renderStickerExport } from "./exportUtils";
import { ExportOptions } from "./projectUtils";
import { createStickerZip, downloadStickerZip } from "./zipExportUtils";

vi.mock("./downloadUtils", () => ({
    dataURLToBlob: vi.fn(async () => new Blob(["png"], { type: "image/png" })),
    downloadBlob: vi.fn(),
}));
vi.mock("./exportUtils", () => ({ renderStickerExport: vi.fn(() => "data:image/png;base64,x") }));

const options: ExportOptions = {
    bounds: "content",
    background: null,
    pixelRatio: 2,
    filename: "unused",
};

describe("zipExportUtils", () => {
    beforeEach(() => vi.clearAllMocks());

    it("creates entries in order and reports progress", async () => {
        const progress = vi.fn();
        const items = ["01-one.png", "02-two.png"].map((filename) => ({
            filename,
            stage: {} as Konva.Stage,
            layers: [],
        }));

        const archive = await createStickerZip(items, options, progress);
        const zip = await JSZip.loadAsync(await archive.arrayBuffer());

        expect(Object.keys(zip.files)).toEqual(["01-one.png", "02-two.png"]);
        expect(progress.mock.calls).toEqual([
            [1, 2],
            [2, 2],
        ]);
        expect(renderStickerExport).toHaveBeenCalledTimes(2);
        expect(dataURLToBlob).toHaveBeenCalledTimes(2);
    });

    it("rejects empty exports", async () => {
        await expect(createStickerZip([], options)).rejects.toThrow("empty sticker pack");
    });

    it("downloads with a sanitized archive name", async () => {
        await downloadStickerZip(
            [{ filename: "01-one.png", stage: {} as Konva.Stage, layers: [] }],
            options,
            "My / Pack",
        );
        expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), "My-Pack.zip");
    });
});
