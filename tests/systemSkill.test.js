"use strict";

const System = require("../skills/systemSkill");

describe("SystemSkill (yerel, ağsız)", () => {

    test("sistem bilgisi döner", async () => {
        const out = await System.run("sistem bilgisi");
        expect(out).toMatch(/Platform|Hostname|Uptime/i);
    });

    test("bellek bilgisi döner", async () => {
        const out = await System.run("bellek durumu");
        expect(out).toMatch(/Bellek|Toplam|Boş/i);
    });

    test("cpu bilgisi döner", async () => {
        const out = await System.run("cpu bilgisi");
        expect(out).toMatch(/İşlemci|Çekirdek/i);
    });

    test("match doğru", () => {
        expect(System.match("sistem bilgisi")).toBe(true);
        expect(System.match("merhaba")).toBe(false);
    });
});
