import { normalizeStickerList, StickerObject } from "./createSticker";
import { ExportOptions } from "./projectUtils";

export const MAX_PACK_ITEMS = 40;

export type PackSourceType = "saved" | "current";

export interface PackItem {
    id: string;
    sourceType: PackSourceType;
    sourceId?: string;
    name: string;
    layers: StickerObject[];
    addedAt: string;
}

export interface PackDraft {
    packName: string;
    items: PackItem[];
    exportOptions: ExportOptions;
}

export const DEFAULT_PACK_EXPORT_OPTIONS: ExportOptions = {
    bounds: "content",
    background: null,
    pixelRatio: 2,
    filename: "sticker-pack",
};

export function createPackItem(
    sourceType: PackSourceType,
    name: string,
    layers: StickerObject[],
    sourceId?: string,
): PackItem {
    return {
        id: crypto.randomUUID(),
        sourceType,
        sourceId,
        name: name.trim() || "Untitled sticker",
        layers: normalizeStickerList(layers).map((layer) => ({ ...layer })),
        addedAt: new Date().toISOString(),
    };
}

export function createSavedStickerSourceId(layers: StickerObject[]): string {
    return layers.map((layer) => layer.id).join(":");
}

export function hasSavedStickerInPack(items: PackItem[], sourceId: string): boolean {
    return items.some((item) => item.sourceType === "saved" && item.sourceId === sourceId);
}

export function movePackItem(items: PackItem[], itemId: string, offset: -1 | 1): PackItem[] {
    const currentIndex = items.findIndex((item) => item.id === itemId);
    const nextIndex = currentIndex + offset;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return items;

    const nextItems = [...items];
    [nextItems[currentIndex], nextItems[nextIndex]] = [
        nextItems[nextIndex],
        nextItems[currentIndex],
    ];
    return nextItems;
}

export function sanitizeFilenamePart(value: string, fallback: string): string {
    const sanitized = value
        .trim()
        .replace(/[^a-z0-9-_]+/giu, "-")
        .replace(/^-+|-+$/gu, "")
        .slice(0, 80);
    return sanitized || fallback;
}

export function createPackItemFilename(index: number, name: string): string {
    return `${String(index + 1).padStart(2, "0")}-${sanitizeFilenamePart(name, "sticker")}.png`;
}

export function normalizePackDraft(value: unknown): PackDraft {
    if (!value || typeof value !== "object") {
        return {
            packName: "My sticker pack",
            items: [],
            exportOptions: DEFAULT_PACK_EXPORT_OPTIONS,
        };
    }

    const draft = value as Partial<PackDraft>;
    const options = draft.exportOptions;
    const items = Array.isArray(draft.items)
        ? draft.items
              .filter(
                  (item): item is PackItem =>
                      Boolean(item) &&
                      typeof item.id === "string" &&
                      (item.sourceType === "saved" || item.sourceType === "current") &&
                      typeof item.name === "string" &&
                      Array.isArray(item.layers),
              )
              .slice(0, MAX_PACK_ITEMS)
              .map((item) => ({ ...item, layers: normalizeStickerList(item.layers) }))
        : [];

    return {
        packName:
            typeof draft.packName === "string" && draft.packName.trim()
                ? draft.packName
                : "My sticker pack",
        items,
        exportOptions: {
            bounds: options?.bounds === "canvas" ? "canvas" : "content",
            background:
                options?.background === null || typeof options?.background === "string"
                    ? options.background
                    : null,
            pixelRatio:
                options?.pixelRatio === 1 || options?.pixelRatio === 3 ? options.pixelRatio : 2,
            filename:
                typeof options?.filename === "string"
                    ? options.filename
                    : DEFAULT_PACK_EXPORT_OPTIONS.filename,
        },
    };
}
