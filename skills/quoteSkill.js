"use strict";

const axios = require("axios");

/**
 * QuoteSkill — Quotable API (anahtar gerektirmez).
 * "günün sözü", "motivasyon sözü" isteklerini yanıtlar.
 */
module.exports = {
    name: "Quote",

    match(text) {
        return /söz|soz|quote|motivasyon|alfabe|ata(r|) sözü/i.test(text);
    },

    async run() {
        try {
            const res = await axios.get("https://api.quotable.io/random", {
                timeout: 8000
            });
            const d = res.data || {};
            if (!d.content) return "Söz alınamadı.";
            return "💬 \"" + d.content + "\"\n— " + (d.author || "Bilinmiyor");
        } catch (e) {
            // quotable bazen kapalı olabiliyor — yedek söz
            const fallback = [
                { content: "Hayatta en hakiki mürşit ilimdir.", author: "Mustafa Kemal Atatürk" },
                { content: "Başarı, hazırladığın fırsatla buluştuğunda gelir.", author: "Bobby Unser" },
                { content: "Kendin için değil, kendini yaşattığın toplum için çalış.", author: "Anonim" }
            ];
            const q = fallback[Math.floor(Math.random() * fallback.length)];
            return "💬 \"" + q.content + "\"\n— " + q.author;
        }
    }
};
