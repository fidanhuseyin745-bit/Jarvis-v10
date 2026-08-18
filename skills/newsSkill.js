"use strict";

const webAgent = require("../agents/webAgent");

/**
 * NewsSkill — DuckDuckGo tabanlı güncel haber yaklaşımı.
 * "son haberler", "gündem" gibi istekleri yanıtlar.
 */
module.exports = {
    name: "News",

    match(text) {
        return /haber|gündem|gundem|son dakika|gelişme|gelisme|dünyada/i.test(text);
    },

    async run(input) {
        const query = "son haberler " + (input.replace(/haber|gündem|gundem|son dakika|gelişme|gelisme|dünyada/gi, "").trim() || "Türkiye");
        const result = await webAgent.search(query);

        if (!result || !result.success || !Array.isArray(result.results) || result.results.length === 0) {
            return "Güncel haberler alınamadı.";
        }

        const lines = ["📰 Güncel haberler:"];
        result.results.slice(0, 6).forEach((r, i) => {
            lines.push((i + 1) + ". " + (r.title || "(başlıksız)"));
            if (r.snippet) lines.push("   " + r.snippet.slice(0, 150));
        });
        return lines.join("\n");
    }
};
