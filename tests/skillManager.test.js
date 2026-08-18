"use strict";

const skillManager = require("../skills/skillManager");

describe("SkillManager", () => {

    test("skill'leri yükler (en az 5 skill)", () => {
        const list = skillManager.list();
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThanOrEqual(5);
    });

    test("hava durumu eşleşir", async () => {
        const skill = await skillManager.find("hava durumu için istanbul");
        expect(skill).not.toBeNull();
        expect(skill.name).toBe("Weather");
    });

    test("kripto eşleşir", async () => {
        const skill = await skillManager.find("bitcoin fiyatı");
        expect(skill).not.toBeNull();
        expect(skill.name).toBe("Crypto");
    });

    test("döviz eşleşir", async () => {
        const skill = await skillManager.find("dolar ne kadar");
        expect(skill).not.toBeNull();
        expect(skill.name).toBe("Currency");
    });

    test("şaka eşleşir", async () => {
        const skill = await skillManager.find("şaka yap");
        expect(skill).not.toBeNull();
        expect(skill.name).toBe("Joke");
    });

    test("sistem eşleşir", async () => {
        const skill = await skillManager.find("sistem bilgisi");
        expect(skill).not.toBeNull();
        expect(skill.name).toBe("System");
    });

    test("genel sohbette skill eşleşmez (null)", async () => {
        const skill = await skillManager.find("selam nasılsın");
        expect(skill).toBeNull();
    });
});
