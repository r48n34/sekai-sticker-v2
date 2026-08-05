import { create } from "zustand";

import { devtools, persist } from "zustand/middleware";
import { normalizeStickerList, StickerObject } from "../utils/createSticker";
import { initialSticker } from "../data/sticker";

interface CurrentStickerState {
    sticker: StickerObject[];
    modifySticker: (val: StickerObject[]) => void;
}

export function migrateCurrentStickerState(persistedState: unknown): unknown {
    if (!persistedState || typeof persistedState !== "object") return persistedState;

    const state = persistedState as Partial<CurrentStickerState>;
    if (!Array.isArray(state.sticker)) return persistedState;

    return { ...state, sticker: normalizeStickerList(state.sticker) };
}

const useCurrentStickerStore = create<CurrentStickerState>()(
    devtools(
        persist(
            (set) => ({
                sticker: initialSticker,
                modifySticker: (val: StickerObject[]) => {
                    set(() => {
                        // Only save non blob URL content
                        const validStick = val.filter(
                            (v) => !v.content.startsWith("blob:") || Boolean(v.assetId),
                        );

                        return {
                            sticker: validStick,
                        };
                    });
                },
            }),
            {
                name: "sticker-storage",
                version: 2,
                migrate: migrateCurrentStickerState,
            },
        ),
    ),
);

export default useCurrentStickerStore;
