import { create } from "zustand";

import { devtools, persist } from "zustand/middleware";
import { StickerObject } from "../utils/createSticker";
import { initialSticker } from "../data/sticker";

interface CurrentStickerState {
  sticker: StickerObject[];
  modifySticker: (val: StickerObject[]) => void;
}

const useCurrentStickerStore = create<CurrentStickerState>()(
  devtools(
    persist(
      (set) => ({
        sticker: initialSticker,
        modifySticker: (val: StickerObject[]) => {
          set(() => {
            // Only save non blob URL content
            const validStick = val.filter((v) => !v.content.startsWith("blob:"));

            return {
              sticker: validStick,
            };
          });
        },
      }),
      { name: "sticker-storage" },
    ),
  ),
);

export default useCurrentStickerStore;
