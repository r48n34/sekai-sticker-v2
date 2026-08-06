import Konva from "konva";
import { BatchDraft } from "./batchUtils";
import { ExportOptions } from "./projectUtils";
import { downloadStickerZip } from "./zipExportUtils";

export interface BatchExportItem {
    draft: BatchDraft;
    stage: Konva.Stage;
}

export async function downloadBatchZip(
    items: BatchExportItem[],
    options: ExportOptions,
    onProgress?: (current: number, total: number) => void,
): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/gu, "-");
    await downloadStickerZip(
        items.map(({ draft, stage }) => ({
            filename: draft.filename,
            stage,
            layers: draft.layers,
        })),
        options,
        `sekai-sticker-batch-${timestamp}`,
        onProgress,
    );
}
