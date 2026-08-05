import { create } from "zustand";

import { devtools, persist } from "zustand/middleware";
import { normalizeStickerList, StickerObject } from "../utils/createSticker";

interface HistoryStickerState {
    histStickerArray: StickerObject[][];
    addStickerHist: (val: StickerObject[]) => void;
    clearAllStickerHist: () => void;
    clearOneStickerHist: (ind: number) => void;
}

export function migrateHistoryStickerState(persistedState: unknown): unknown {
    if (!persistedState || typeof persistedState !== "object") return persistedState;

    const state = persistedState as Partial<HistoryStickerState>;
    if (!Array.isArray(state.histStickerArray)) return persistedState;

    return {
        ...state,
        histStickerArray: state.histStickerArray.map((sticker) => normalizeStickerList(sticker)),
    };
}

const useHistoryStickerStore = create<HistoryStickerState>()(
    devtools(
        persist(
            (set) => ({
                histStickerArray: [],
                addStickerHist: (val: StickerObject[]) => {
                    set((state) => {
                        // Only save non blob URL content
                        const validStick = val.filter(
                            (v) => !v.content.startsWith("blob:") || Boolean(v.assetId),
                        );

                        return {
                            histStickerArray: [...state.histStickerArray, validStick],
                        };
                    });
                },
                clearAllStickerHist: () => {
                    set(() => {
                        return {
                            histStickerArray: [],
                        };
                    });
                },
                clearOneStickerHist: (ind: number) => {
                    set((state) => {
                        return {
                            histStickerArray: state.histStickerArray.filter((_, i) => i !== ind),
                        };
                    });
                },
            }),
            {
                name: "hist-sticker-ls-storage",
                version: 2,
                migrate: migrateHistoryStickerState,
            },
        ),
    ),
);

export default useHistoryStickerStore;
