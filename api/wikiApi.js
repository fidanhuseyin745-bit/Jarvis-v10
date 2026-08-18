"use strict";

const http = require("./httpClient");

class WikiApi {

    constructor() {
        this.apiBase = "https://tr.wikipedia.org/w/api.php";
        this.summaryBase = "https://tr.wikipedia.org/api/rest_v1/page/summary/";
    }

    async search(query) {
        const q = String(query || "").trim();
        if (!q) return null;

        const url = this.apiBase +
            "?action=query&list=search&srsearch=" +
            encodeURIComponent(q) +
            "&format=json&srlimit=1&srprop=";

        try {
            const data = await http.getJson(url, { timeout: 6000 });
            if (!data.query || !data.query.search || !data.query.search.length) {
                return null;
            }
            const first = data.query.search[0];
            return await this.summary(first.title);
        } catch {
            return null;
        }
    }

    async summary(title) {
        const url = this.summaryBase + encodeURIComponent(title.replace(/\s+/g, "_"));
        try {
            const data = await http.getJson(url, { timeout: 6000 });
            if (!data || data.type === "disambiguation") {
                return null;
            }
            const text = (data.extract || "").trim();
            if (!text) return null;
            return "📖 " + data.title + ": " + text;
        } catch {
            return null;
        }
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();
        if (lower.includes("vikipedi") || lower.includes("wikipedia")) {
            const m = text.match(/(?:vikipedi|wikipedia)[:\s]+(.+)/i);
            if (m) return { type: "wiki", query: m[1].trim() };
        }
        return null;
    }

}

module.exports = new WikiApi();
