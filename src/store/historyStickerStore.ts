import { create } from "zustand";

import { devtools, persist } from "zustand/middleware";
import { StickerObject } from "../utils/createSticker";

interface HistoryStickerState {
  histStickerArray: StickerObject[][];
  addStickerHist: (val: StickerObject[]) => void;
  clearAllStickerHist: () => void;
  clearOneStickerHist: (ind: number) => void;
}

const useHistoryStickerStore = create<HistoryStickerState>()(
  devtools(
    persist(
      (set) => ({
        histStickerArray: [],
        addStickerHist: (val: StickerObject[]) => {
          set((state) => {
            // Only save non blob URL content
            const validStick = val.filter((v) => !v.content.startsWith("blob:"));

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
      { name: "hist-sticker-ls-storage" },
    ),
  ),
);

export default useHistoryStickerStore;
