import { StickerChatactor } from "../data/characters";
import { CONFIGS, createImagesInit, createText, StickerObject } from "./createSticker";

export const MAX_BATCH_PHRASES = 20;
export const MIN_BATCH_FONT_SIZE = 12;
export const BATCH_TEXT_SAFE_WIDTH = 260;
export const DEFAULT_BATCH_TEXT_X = (CONFIGS.stageWidth - BATCH_TEXT_SAFE_WIDTH) / 2;
export const DEFAULT_BATCH_TEXT_Y = CONFIGS.initialTextY;

export interface BatchStyleOptions {
    fontFamily: NonNullable<StickerObject["fontFamily"]>;
    maxFontSize: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
    rotation: number;
    textX: number;
    textY: number;
}

export interface BatchDraft {
    id: string;
    phrase: string;
    layers: StickerObject[];
    filename: string;
    fontSize: number;
    valid: boolean;
    error?: "text-too-wide";
}

export type TextWidthMeasurer = (text: string, fontFamily: string, fontSize: number) => number;

export function parseBatchPhrases(input: string): string[] {
    return input
        .split(/\r?\n/u)
        .map((phrase) => phrase.trim())
        .filter(Boolean);
}

export function sanitizeBatchFilename(phrase: string, index: number): string {
    const slug = phrase
        .normalize("NFKC")
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/gu, "")
        .slice(0, 40);
    const position = String(index + 1).padStart(2, "0");

    return `${position}-${slug || "sticker"}.png`;
}

export function measureCanvasText(text: string, fontFamily: string, fontSize: number): number {
    if (typeof document === "undefined") {
        return text.length * fontSize * 0.55;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return text.length * fontSize * 0.55;

    context.font = `${fontSize}px ${JSON.stringify(fontFamily)}`;
    return context.measureText(text).width;
}

export function fitBatchFontSize(
    text: string,
    style: BatchStyleOptions,
    measureText: TextWidthMeasurer = measureCanvasText,
): number | null {
    const maximum = Math.max(MIN_BATCH_FONT_SIZE, Math.floor(style.maxFontSize));

    for (let fontSize = maximum; fontSize >= MIN_BATCH_FONT_SIZE; fontSize -= 1) {
        const width = measureText(text, style.fontFamily, fontSize) + style.strokeWidth * 2;
        if (width <= BATCH_TEXT_SAFE_WIDTH) return fontSize;
    }

    return null;
}

export function createBatchDrafts(
    character: StickerChatactor,
    phrases: string[],
    imageSize: { width: number; height: number },
    style: BatchStyleOptions,
    measureText: TextWidthMeasurer = measureCanvasText,
): BatchDraft[] {
    return phrases.map((phrase, index) => {
        const fittedFontSize = fitBatchFontSize(phrase, style, measureText);
        const textLayer = {
            ...createText(phrase, style.fill),
            x: style.textX,
            y: style.textY,
            width: BATCH_TEXT_SAFE_WIDTH,
            fontFamily: style.fontFamily,
            fontSize: fittedFontSize ?? MIN_BATCH_FONT_SIZE,
            fill: style.fill,
            stroke: style.stroke,
            strokeWidth: style.strokeWidth,
            rotation: style.rotation,
        };
        const imageLayer = createImagesInit(character.img, imageSize.width, imageSize.height);

        return {
            id: imageLayer.id,
            phrase,
            layers: [imageLayer, textLayer],
            filename: sanitizeBatchFilename(phrase, index),
            fontSize: textLayer.fontSize,
            valid: fittedFontSize !== null,
            error: fittedFontSize === null ? "text-too-wide" : undefined,
        };
    });
}
