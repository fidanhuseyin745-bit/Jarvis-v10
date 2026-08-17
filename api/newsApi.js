"use strict";

const http = require("./httpClient");

class NewsApi {

    constructor() {
        this.feeds = [
            { name: "NTV Gundem", url: "https://www.ntv.com.tr/gundem.rss" },
            { name: "BBC Turkce", url: "https://feeds.bbci.co.uk/turkce/rss.xml" }
        ];
    }

    async getNews() {
        for (const feed of this.feeds) {
            try {
                const res = await http.get(feed.url, { timeout: 8000 });
                const items = this._parseRss(res.body);
                if (items && items.length) {
                    return this._formatNews(feed.name, items.slice(0, 5));
                }
            } catch {
            }
        }
        return null;
    }

    _parseRss(xml) {
        const items = [];
        const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
        let m;
        while ((m = itemRegex.exec(xml)) !== null && items.length < 10) {
            const block = m[1];
            const title = this._extract(block, "title");
            const desc = this._extract(block, "description");
            const link = this._extract(block, "link");
            if (title) {
                items.push({
                    title: this._decode(title),
                    desc: desc ? this._decode(desc).replace(/<[^>]+>/g, "").slice(0, 120) : "",
                    link: link
                });
            }
        }
        return items;
    }

    _extract(block, tag) {
        const m = block.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i"));
        return m ? m[1].trim() : "";
    }

    _decode(s) {
        return s
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
    }

    _formatNews(source, items) {
        const lines = ["📰 " + source + " — son haberler:", ""];
        items.forEach((item, i) => {
            lines.push((i + 1) + ". " + item.title);
            if (item.desc) lines.push("   " + item.desc);
        });
        return lines.join("\n");
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();
        if (lower.includes("haber") && (lower.includes("var") || lower.includes("neler") || lower.includes("güncel") || lower.includes("bugün"))) {
            return { type: "news" };
        }
        return null;
    }

}

module.exports = new NewsApi();
