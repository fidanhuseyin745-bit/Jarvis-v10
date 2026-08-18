"use strict";

const DecisionEngine = require("../engine/decisionEngine");

describe("DecisionEngine", () => {

    test("haber için news intent döner", () => {
        const r = DecisionEngine.decide("bugün haberler ne");
        expect(r.intent).toBe("news");
        expect(r.score.web).toBeGreaterThan(0);
    });

    test("finans için market intent döner", () => {
        const r = DecisionEngine.decide("bitcoin fiyatı");
        expect(r.intent).toBe("market");
        expect(r.score.market).toBeGreaterThan(0);
    });

    test("kod için coding intent döner", () => {
        const r = DecisionEngine.decide("javascript hata düzelt");
        expect(r.intent).toBe("coding");
        expect(r.score.coding).toBeGreaterThan(0);
    });

    test("selamlama sohbet için chat/nedir dışı döner", () => {
        const r = DecisionEngine.decide("selam iyi günler");
        expect(["chat", "research", "explain"]).toContain(r.intent);
    });

    test("plan skor sıralı döner", () => {
        const r = DecisionEngine.decide("dolar ve bugün haber");
        expect(Array.isArray(r.plan)).toBe(true);
        // en yüksek skor başta
        for (let i = 1; i < r.plan.length; i++) {
            expect(r.plan[i - 1][1]).toBeGreaterThanOrEqual(r.plan[i][1]);
        }
    });

    test("boş girdi güvenli", () => {
        const r = DecisionEngine.decide("");
        expect(r.intent).toBe("chat");
        expect(r.confidence).toBeGreaterThanOrEqual(0);
    });
});
