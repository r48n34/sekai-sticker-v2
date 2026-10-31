import { createImages, createImagesInit, createText, StickerObject } from "../utils/createSticker";

/**
 * Cache-busting suffix. The character art lives in `public/img/` and is served
 * with a 7-day cache header, so older browsers can keep a stale (non-image)
 * response for a URL they already requested. Bumping this version gives every
 * template a fresh cache key without changing the files on disk.
 */
const ART_VERSION = "v2";

function artPath(path: string) {
    return `/${path}?${ART_VERSION}`;
}

export interface StickerTemplate {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    /** Builds the layers for this template. Async because the art size is read from the image. */
    createLayers: () => Promise<StickerObject[]>;
}

/**
 * Uses the real pixel size of the art so the character is never stretched, and
 * falls back to the known size if the image cannot be measured.
 */
async function createStickerLayer(
    src: string,
    fallbackWidth: number,
    fallbackHeight: number,
): Promise<StickerObject> {
    try {
        return await createImages(src);
    } catch {
        return createImagesInit(src, fallbackWidth, fallbackHeight);
    }
}

export const stickerTemplates: StickerTemplate[] = [
    {
        id: "classic",
        name: "Classic reaction",
        description: "Character with bold curved-style reaction text",
        thumbnail: artPath("img/Ichika/Ichika_09.png"),
        createLayers: async () => [
            await createStickerLayer(artPath("img/Ichika/Ichika_09.png"), 275, 256),
            createText("Wonderhoy", "#50668f"),
        ],
    },
    {
        id: "cheer",
        name: "Cheer message",
        description: "Bright encouragement with room for a short message",
        thumbnail: artPath("img/emu/Emu_09.png"),
        createLayers: async () => {
            const text = createText("You got this!", "#ff66aa");

            return [
                await createStickerLayer(artPath("img/emu/Emu_09.png"), 256, 225),
                { ...text, x: 24, y: 20, rotation: -8, fontSize: 34 },
            ];
        },
    },
    {
        id: "quiet",
        name: "Quiet mood",
        description: "A softer layout for calm or reflective reactions",
        thumbnail: artPath("img/Kanade/Kanade_09.png"),
        createLayers: async () => {
            const text = createText("Take it easy", "#7766aa");

            return [
                await createStickerLayer(artPath("img/Kanade/Kanade_09.png"), 209, 248),
                { ...text, x: 16, y: 256, rotation: 0, fontSize: 30 },
            ];
        },
    },
];
