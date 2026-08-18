"use strict";

const webAgent = require("../agents/webAgent");

describe("webAgent", () => {

    test("boş sorgu güvenli hata döner", async () => {
        const r = await webAgent.search("");
        expect(r.success).toBe(false);
    });

    test("_stripHtml html temizler", () => {
        const clean = webAgent._stripHtml("<b>Merhaba</b> &amp; <i>dünya</i>");
        expect(clean).toBe("Merhaba & dünya");
    });
});
