import { describe, expect, it } from "vitest";
import {
    commitEditorHistory,
    createEditorHistory,
    redoEditorHistory,
    reorderArray,
    undoEditorHistory,
} from "./editorHistory";

describe("editorHistory", () => {
    it("supports undo and redo", () => {
        const initial = createEditorHistory(["first"]);
        const edited = commitEditorHistory(initial, ["second"]);
        const undone = undoEditorHistory(edited);

        expect(undone.present).toEqual(["first"]);
        expect(redoEditorHistory(undone).present).toEqual(["second"]);
    });

    it("clears the redo branch after a new edit", () => {
        const initial = createEditorHistory(["first"]);
        const second = commitEditorHistory(initial, ["second"]);
        const undone = undoEditorHistory(second);
        const branched = commitEditorHistory(undone, ["third"]);

        expect(branched.future).toEqual([]);
        expect(redoEditorHistory(branched)).toBe(branched);
    });

    it("coalesces continuous changes into one undo step", () => {
        const initial = createEditorHistory(0);
        const firstChange = commitEditorHistory(initial, 1);
        const continuousChange = commitEditorHistory(firstChange, 2, { coalesce: true });

        expect(continuousChange.past).toEqual([0]);
        expect(undoEditorHistory(continuousChange).present).toBe(0);
    });

    it("caps the number of saved snapshots", () => {
        let history = createEditorHistory(0);
        for (let value = 1; value <= 5; value += 1) {
            history = commitEditorHistory(history, value, { limit: 3 });
        }

        expect(history.past).toEqual([2, 3, 4]);
    });

    it("reorders without mutating the source array", () => {
        const source = ["bottom", "middle", "top"];
        const reordered = reorderArray(source, 0, 2);

        expect(reordered).toEqual(["middle", "top", "bottom"]);
        expect(source).toEqual(["bottom", "middle", "top"]);
    });
});
