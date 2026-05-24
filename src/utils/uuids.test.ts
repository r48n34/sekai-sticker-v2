import { describe, expect, it } from "vitest";

import { uuid } from "./uuids";

describe("uuid", () => {
    it("generates a 20-character id from hex-like chars", () => {
        const id = uuid();
        expect(id).toHaveLength(20);
        expect(id).toMatch(/^[a-f0-9-]+$/);
        expect(id[8]).toBe("-");
        expect(id[13]).toBe("-");
        expect(id[18]).toBe("-");
    });

    it("is not constant across many calls", () => {
        const ids = new Set(Array.from({ length: 40 }, () => uuid()));
        expect(ids.size).toBeGreaterThan(1);
    });
});
