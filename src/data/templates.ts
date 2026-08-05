import { createImagesInit, createText, StickerObject } from "../utils/createSticker";

export interface StickerTemplate {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    createLayers: () => StickerObject[];
}

export const stickerTemplates: StickerTemplate[] = [
    {
        id: "classic",
        name: "Classic reaction",
        description: "Character with bold curved-style reaction text",
        thumbnail: "img/Ichika/Ichika_09.png",
        createLayers: () => [
            createImagesInit("img/Ichika/Ichika_09.png", 275, 256),
            createText("Wonderhoy", "#50668f"),
        ],
    },
    {
        id: "cheer",
        name: "Cheer message",
        description: "Bright encouragement with room for a short message",
        thumbnail: "img/emu/Emu_09.png",
        createLayers: () => {
            const text = createText("You got this!", "#ff66aa");
            return [
                createImagesInit("img/emu/Emu_09.png", 275, 256),
                { ...text, x: 24, y: 20, rotation: -8, fontSize: 34 },
            ];
        },
    },
    {
        id: "quiet",
        name: "Quiet mood",
        description: "A softer layout for calm or reflective reactions",
        thumbnail: "img/Kanade/Kanade_09.png",
        createLayers: () => {
            const text = createText("Take it easy", "#7766aa");
            return [
                createImagesInit("img/Kanade/Kanade_09.png", 275, 256),
                { ...text, x: 28, y: 230, rotation: 0, fontSize: 30 },
            ];
        },
    },
];
