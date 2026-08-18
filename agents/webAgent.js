"use strict";

const axios = require("axios");

/**
 * WebAgent: gerçek internet araması yapar.
 * Önce DuckDuckGo HTML endpoint'ini dener; başarısız olursa
 * DuckDuckGo Instant Answer API'ine düşer. Lokal bir
 * web sunucusuna bağımlılığı yoktur.
 */
class WebAgent {

    constructor() {
        this.timeout = 8000;
    }

    _stripHtml(html) {
        return String(html || "")
            .replace(/<[^>]*>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
    }

    async searchDuckHtml(query) {
        const res = await axios.get("https://html.duckduckgo.com/html/", {
            params: { q: query },
            timeout: this.timeout,
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; JarvisBot/1.0)"
            }
        });

        const html = res.data || "";
        const results = [];
        const blocks = html.split(/<a rel="nofollow" class="result__a"/);

        for (let i = 1; i < blocks.length && results.length < 8; i++) {
            const block = blocks[i];
            const hrefMatch = block.match(/href="([^"]+)"/);
            const titleMatch = block.match(/>([^<]+)<\/a>/);
            const snippetMatch = block.match(
                /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/
            );

            const title = titleMatch ? this._stripHtml(titleMatch[1]) : "";
            const snippet = snippetMatch ? this._stripHtml(snippetMatch[1]) : "";
            let href = hrefMatch ? hrefMatch[1] : "";

            if (href && href.indexOf("http") !== 0) {
                href = "https://duckduckgo.com" + href;
            }
            // DDG redirect URL'inden gerçek URL çıkar
            const uddg = href.match(/uddg=([^&]+)/);
            if (uddg) {
                try { href = decodeURIComponent(uddg[1]); } catch (e) { /* yoksay */ }
            }

            if (title || snippet) {
                results.push({ title, snippet, url: href });
            }
        }

        return results;
    }

    async searchInstant(query) {
        const res = await axios.get("https://api.duckduckgo.com/", {
            params: { q: query, format: "json", no_html: 1, no_redirect: 1 },
            timeout: this.timeout,
            headers: { "User-Agent": "Mozilla/5.0 (compatible; JarvisBot/1.0)" }
        });
        const d = res.data || {};
        const results = [];
        if (d.AbstractText) {
            results.push({
                title: d.Heading || query,
                snippet: d.AbstractText,
                url: d.AbstractURL || ""
            });
        }
        if (Array.isArray(d.RelatedTopics)) {
            for (const t of d.RelatedTopics) {
                if (results.length >= 8) break;
                if (t && t.Text && t.FirstURL) {
                    results.push({ title: t.Text.split(" - ")[0], snippet: t.Text, url: t.FirstURL });
                }
            }
        }
        return results;
    }

    async search(query) {
        query = String(query || "").trim();
        if (!query) {
            return { success: false, error: "Boş sorgu." };
        }

        try {
            const results = await this.searchDuckHtml(query);
            if (results.length > 0) {
                return { success: true, query, results };
            }
        } catch (e) {
            // HTML başarısız olursa instant API dener
        }

        try {
            const results = await this.searchInstant(query);
            if (results.length > 0) {
                return { success: true, query, results };
            }
            return { success: false, query, error: "Sonuç bulunamadı." };
        } catch (err) {
            return { success: false, query, error: err.message };
        }
    }

    async run(input) {
        return await this.search(input);
    }
}

module.exports = new WebAgent();
