import { describe, expect, it } from "vitest";
import { calculateContentBounds } from "./exportUtils";
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
});
