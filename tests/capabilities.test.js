"use strict";

const capabilities = require("../webserver/capabilities");

describe("capabilities facade", () => {

    test("meta sürüm ve skill listesi döner", () => {
        const m = capabilities.meta();
        expect(m.name).toBe("Jarvis");
        expect(Array.isArray(m.skills)).toBe(true);
        expect(typeof m.aiConfigured).toBe("boolean");
    });

    test("listSkills array döner", () => {
        const list = capabilities.listSkills();
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);
    });

    test("dispatch skill eşleşirse matched=true", async () => {
        const r = await capabilities.dispatch("şaka yap");
        expect(r.matched).toBe(true);
        expect(typeof r.reply).toBe("string");
    });

    test("dispatch eşleşme yoksa AI'a düşer (string)", async () => {
        const r = await capabilities.dispatch("çok genel bir sohbet cümlesi");
        expect(typeof r.reply).toBe("string");
    });

    test("webSearch sonuç formatı", async () => {
        const r = await capabilities.webSearch("javascript");
        expect(r).toBeDefined();
        expect(r).toHaveProperty("query");
    });
});
