"use strict";

const webAgent = require("../agents/webAgent");

/**
 * SearchSkill — DuckDuckGo tabanlı gerçek web araması (webAgent üzerinden).
 * "internette ara: X" gibi istekleri yanıtlar.
 */
module.exports = {
    name: "Search",

    match(text) {
        return /internette ara|web.?de ara|google.?da ara|araştır/i.test(text);
    },

    async run(input) {
        const query = this._extractQuery(input);
        const result = await webAgent.search(query);

        if (!result || !result.success || !Array.isArray(result.results) || result.results.length === 0) {
            return "'" + query + "' için web sonucu bulunamadı.";
        }

        const lines = ["🔎 '" + query + "' için sonuçlar:"];
        result.results.slice(0, 5).forEach((r, i) => {
            lines.push((i + 1) + ". " + (r.title || "(başlıksız)"));
            if (r.snippet) lines.push("   " + r.snippet.slice(0, 160));
            if (r.url) lines.push("   " + r.url);
        });
        return lines.join("\n");
    },

    _extractQuery(input) {
        let q = input.replace(/internette ara|web.?de ara|google.?da ara|araştır|bana/i, "").trim();
        q = q.replace(/^[:\-—\s]+/, "").trim();
        return q || input;
    }
};
