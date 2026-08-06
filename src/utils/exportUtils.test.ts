import { describe, expect, it } from "vitest";
import Konva from "konva";
import { calculateContentBounds, calculateRenderedContentBounds } from "./exportUtils";
import { StickerObject } from "./createSticker";

describe("exportUtils", () => {
    it("calculates visible content bounds including negative positions", () => {
        const layers: StickerObject[] = [
            { id: "1", format: "image", content: "a", x: -10, y: 5, width: 50, height: 40 },
            { id: "2", format: "image", content: "b", x: 80, y: 60, width: 20, height: 30 },
            {
                id: "3",
                format: "image",
                content: "c",
                x: 500,
                y: 500,
                width: 10,
                height: 10,
                visible: false,
            },
        ];

        expect(calculateContentBounds(layers)).toEqual({ x: -10, y: 5, width: 110, height: 85 });
    });

    it("uses rendered node bounds so rotations and strokes are not cropped", () => {
        const textNode = {
            getClassName: () => "Text",
            isVisible: () => true,
            getAbsoluteOpacity: () => 1,
            getClientRect: () => ({ x: 12.4, y: -3.2, width: 101.3, height: 56.1 }),
        } as unknown as Konva.Node;
        const imageNode = {
            getClassName: () => "Image",
            isVisible: () => true,
            getAbsoluteOpacity: () => 1,
            getClientRect: () => ({ x: 30, y: 40, width: 120.2, height: 90.7 }),
        } as unknown as Konva.Node;
        const stage = {
            find: (predicate: (node: Konva.Node) => boolean) =>
                [textNode, imageNode].filter(predicate),
        } as unknown as Konva.Stage;

        expect(calculateRenderedContentBounds(stage)).toEqual({
            x: 12,
            y: -4,
            width: 139,
            height: 135,
        });
    });
});
