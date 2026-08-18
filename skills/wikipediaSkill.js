"use strict";

const axios = require("axios");

/**
 * WikipediaSkill — Wikipedia opensearch + özet (anahtar gerektirmez).
 * "kuantum nedir", "einstein hakkında" gibi istekleri yanıtlar.
 */
module.exports = {
    name: "Wikipedia",

    match(text) {
        return /nedir|kimdir|hakkında|hakkinda|anlat|açıkla|acikla|wikipedia/i.test(text);
    },

    async run(input) {
        const term = this._extractTerm(input);
        const title = await this._searchTitle(term);
        if (!title) return "'" + term + "' için Wikipedia'da madde bulunamadı.";

        const summary = await this._summary(title);
        if (!summary.success) return summary.error;
        return "📚 Wikipedia (" + title + "):\n" + summary.text;
    },

    _extractTerm(input) {
        let t = input.replace(/nedir|kimdir|hakkında|hakkinda|bana|anlat|açıkla|acikla|wikipedia/gi, "").trim();
        t = t.replace(/[?.!]/g, "").trim();
        return t || input;
    },

    async _searchTitle(term) {
        const langs = ["tr", "en"];
        const headers = { "User-Agent": "JarvisBot/1.0 (https://github.com/fidanhuseyin745-bit/Jarvis-v10)" };
        for (const lang of langs) {
            try {
                const res = await axios.get("https://" + lang + ".wikipedia.org/w/api.php", {
                    params: { action: "query", list: "search", srsearch: term, format: "json", srlimit: 1 },
                    timeout: 8000,
                    headers
                });
                const s = res.data && res.data.query && res.data.query.search;
                if (s && s[0]) return s[0].title;
            } catch (e) { /* diger dili dene */ }
        }
        return null;
    },

    async _summary(title) {
        const langs = ["tr", "en"];
        for (const lang of langs) {
            try {
                const res = await axios.get("https://" + lang + ".wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(title), {
                    timeout: 8000,
                    headers: { "User-Agent": "JarvisBot/1.0" }
                });
                if (res.data && res.data.extract) return { success: true, text: res.data.extract, lang };
            } catch (e) { /* diger dili dene */ }
        }
        return { success: false, error: "Özet alınamadı." };
    }
};
