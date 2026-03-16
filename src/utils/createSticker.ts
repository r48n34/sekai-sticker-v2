import { getImagesWidthAndHeight } from "./imagesUtils";
import { uuid } from "./uuids";

export const CONFIGS = {
  stageWidth: 300,
  stageHeight: 300,

  initialStickerX: 12,
  initialStickerY: 28,

  initialTextX: 40,
  initialTextY: 26,
};

export interface StickerObject {
  x: number;
  y: number;
  rotation?: number;
  fill?: string; // Color code string
  stroke?: string; // Color code string
  fontSize?: number;
  width?: number;
  height?: number;
  letterSpacing?: number;

  // Is a text, image or the external image
  format: "text" | "image" | "externalImage";

  // Text content OR Images URL
  content: string;

  // Text outer stroke
  strokeWidth?: number;

  // Default font | Chinese word font
  fontFamily?: "YurukaStd" | "ChillRoundGothic_Bold";

  // UUID
  id: string;

  // The object to be created at, newly added on 16/01/2025, may not exist in the old version
  createdDate?: Date;

  // The object to be created at, newly added on 16/01/2025, may not exist in the old version
  updatedDate?: Date;
}

export function createText(text: string = "Hello", color: string = "#50668f"): StickerObject {
  return {
    x: CONFIGS.initialTextX,
    y: CONFIGS.initialTextY,
    fontSize: 42,
    rotation: 20,
    fill: color,
    stroke: "#ffffff",
    letterSpacing: 0,
    strokeWidth: 12,
    format: "text",
    fontFamily: "YurukaStd",
    id: uuid(),
    content: text,

    createdDate: new Date(),
    updatedDate: new Date(),
  };
}

// URL images or Local images
export async function createExternalImages(
  src: string = "img/Ichika/Ichika_09.png",
): Promise<StickerObject> {
  await fetch(src);

  let { w, h } = await getImagesWidthAndHeight(src);

  while (w >= 300 || h >= 300) {
    w = w / 3;
    h = h / 3;
  }

  return {
    x: CONFIGS.initialStickerX,
    y: CONFIGS.initialStickerY,
    width: w,
    height: h,

    format: "externalImage",
    content: src,
    id: uuid(),

    createdDate: new Date(),
    updatedDate: new Date(),
  };
}

// Sticker
export async function createImages(
  src: string = "img/Ichika/Ichika_09.png",
): Promise<StickerObject> {
  const { w, h } = await getImagesWidthAndHeight(src);

  return {
    x: CONFIGS.initialStickerX,
    y: CONFIGS.initialStickerY,
    width: w,
    height: h,

    format: "image",
    content: src,
    id: uuid(),

    createdDate: new Date(),
    updatedDate: new Date(),
  };
}

// Sticker
export function createImagesInit(
  src: string = "img/Ichika/Ichika_09.png",
  w: number,
  h: number,
): StickerObject {
  return {
    x: CONFIGS.initialStickerX,
    y: CONFIGS.initialStickerY,
    width: w,
    height: h,

    format: "image",
    content: src,
    id: uuid(),

    createdDate: new Date(),
    updatedDate: new Date(),
  };
}

export function duplicateNewObject(sticker: StickerObject): StickerObject {
  return {
    ...sticker,
    x: sticker.x - 15,
    y: sticker.y - 15,
    id: uuid(),

    updatedDate: new Date(),
  };
}

export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
