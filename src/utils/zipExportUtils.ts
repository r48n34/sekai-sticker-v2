import Konva from "konva";
import { StickerObject } from "./createSticker";
import { dataURLToBlob, downloadBlob } from "./downloadUtils";
import { renderStickerExport } from "./exportUtils";
import { sanitizeFilenamePart } from "./packUtils";
import { ExportOptions } from "./projectUtils";

export interface StickerZipItem {
    filename: string;
    stage: Konva.Stage;
    layers: StickerObject[];
}

export async function createStickerZip(
    items: StickerZipItem[],
    options: ExportOptions,
    onProgress?: (current: number, total: number) => void,
): Promise<Blob> {
    if (items.length === 0) throw new Error("Cannot export an empty sticker pack");

    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();

    for (const [index, item] of items.entries()) {
        onProgress?.(index + 1, items.length);
        const dataUrl = renderStickerExport(item.stage, item.layers, options);
        zip.file(item.filename, await dataURLToBlob(dataUrl));
    }

    return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export async function downloadStickerZip(
    items: StickerZipItem[],
    options: ExportOptions,
    archiveName: string,
    onProgress?: (current: number, total: number) => void,
): Promise<void> {
    const archive = await createStickerZip(items, options, onProgress);
    downloadBlob(archive, `${sanitizeFilenamePart(archiveName, "sticker-pack")}.zip`);
}
