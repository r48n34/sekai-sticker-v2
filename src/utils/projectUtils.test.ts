import { describe, expect, it } from "vitest";
import {
    createProjectDocument,
    CURRENT_PROJECT_VERSION,
    parseProjectDocument,
} from "./projectUtils";
import { StickerObject } from "./createSticker";

const layer: StickerObject = {
    id: "layer-1",
    x: 10,
    y: 20,
    format: "text",
    content: "Hello",
};

describe("projectUtils", () => {
    it("creates a versioned project with normalized layers", () => {
        const project = createProjectDocument("My sticker", [layer]);

        expect(project.version).toBe(CURRENT_PROJECT_VERSION);
        expect(project.name).toBe("My sticker");
        expect(project.layers[0]).toMatchObject({ visible: true, locked: false, opacity: 1 });
    });

    it("migrates compatible legacy JSON defaults", () => {
        const project = parseProjectDocument(
            JSON.stringify({ id: "legacy", name: "Legacy", layers: [layer] }),
        );

        expect(project.canvas).toEqual({ width: 300, height: 300, background: null });
        expect(project.layers[0].visible).toBe(true);
    });

    it("rejects unrelated JSON", () => {
        expect(() => parseProjectDocument('{"hello":"world"}')).toThrow("Invalid project file");
    });
});
