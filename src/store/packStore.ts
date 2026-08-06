import { create } from "zustand";
import { persist } from "zustand/middleware";
import { StickerObject } from "../utils/createSticker";
import {
    createPackItem,
    DEFAULT_PACK_EXPORT_OPTIONS,
    hasSavedStickerInPack,
    MAX_PACK_ITEMS,
    movePackItem,
    normalizePackDraft,
    PackItem,
} from "../utils/packUtils";
import { ExportOptions } from "../utils/projectUtils";

interface PackState {
    packName: string;
    items: PackItem[];
    exportOptions: ExportOptions;
    setPackName: (name: string) => void;
    setExportOptions: (options: ExportOptions) => void;
    addCurrentSticker: (layers: StickerObject[]) => boolean;
    addSavedSticker: (sticker: { id: string; name: string; layers: StickerObject[] }) => boolean;
    moveItem: (id: string, offset: -1 | 1) => void;
    removeItem: (id: string) => void;
    clearItems: () => void;
}

export const migratePackState = (persistedState: unknown): unknown =>
    normalizePackDraft(persistedState);

const usePackStore = create<PackState>()(
    persist(
        (set, get) => ({
            packName: "My sticker pack",
            items: [],
            exportOptions: DEFAULT_PACK_EXPORT_OPTIONS,
            setPackName: (packName) => set({ packName }),
            setExportOptions: (exportOptions) => set({ exportOptions }),
            addCurrentSticker: (layers) => {
                if (get().items.length >= MAX_PACK_ITEMS) return false;
                set((state) => ({
                    items: [...state.items, createPackItem("current", "Current sticker", layers)],
                }));
                return true;
            },
            addSavedSticker: (sticker) => {
                const { items } = get();
                if (items.length >= MAX_PACK_ITEMS || hasSavedStickerInPack(items, sticker.id)) {
                    return false;
                }
                set({
                    items: [
                        ...items,
                        createPackItem("saved", sticker.name, sticker.layers, sticker.id),
                    ],
                });
                return true;
            },
            moveItem: (id, offset) =>
                set((state) => ({ items: movePackItem(state.items, id, offset) })),
            removeItem: (id) =>
                set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
            clearItems: () => set({ items: [] }),
        }),
        {
            name: "sekai-sticker-pack-draft",
            version: 2,
            migrate: migratePackState,
        },
    ),
);

export default usePackStore;
