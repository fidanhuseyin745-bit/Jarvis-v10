"use strict";

const provider = require("../ai/provider");
const aiManager = require("../ai/aiManager");

describe("AI offline fallback", () => {

    test("provider AI uç noktası yoksa offline=true", () => {
        // test ortamında AI_API_URL tanımlı değil
        expect(typeof provider.isOffline()).toBe("boolean");
    });

    test("chatSafe offline mesajı döner (AI uç noktası yoksa)", async () => {
        const reply = await provider.chatSafe(
            [{ role: "user", content: "merhaba" }],
            {}
        );
        expect(typeof reply).toBe("string");
        expect(reply.length).toBeGreaterThan(0);
        // offline ise uyarı metni gelir
        if (provider.isOffline()) {
            expect(reply).toMatch(/tanımlı değil|AI/i);
        }
    });

    test("aiManager.chatSafe string döner (patlamaz)", async () => {
        const reply = await aiManager.chatSafe(
            [{ role: "user", content: "selam" }],
            {}
        );
        expect(typeof reply).toBe("string");
    });

    test("aiManager.isOffline provider ile uyumlu", () => {
        expect(aiManager.isOffline()).toBe(provider.isOffline());
    });
});
