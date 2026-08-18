"use strict";

class TextApi {

    wordCount(text) {
        const words = String(text || "").trim().split(/\s+/).filter(Boolean);
        return `📝 ${words.length} kelime.`;
    }

    charCount(text) {
        const chars = String(text || "").replace(/\s/g, "").length;
        return `📝 ${chars} karakter (boşluksuz).`;
    }

    reverse(text) {
        return `🔄 ${String(text || "").split("").reverse().join("")}`;
    }

    uppercase(text) {
        return `🔡 ${String(text || "").toUpperCase()}`;
    }

    lowercase(text) {
        return `🔡 ${String(text || "").toLowerCase()}`;
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();
        const stripped = lower.replace(/(kaç kelime|kelime sayısı|kelime say|kelime var)\b/g, "").trim();

        if (lower.includes("kaç kelime") || lower.includes("kelime sayısı")) {
            const content = this._extractContent(text, ["kaç kelime", "kelime sayısı", "kelime say", "kelime var"]);
            if (content) return this.wordCount(content);
        }

        if (lower.includes("kaç karakter") || lower.includes("karakter sayısı")) {
            const content = this._extractContent(text, ["kaç karakter", "karakter sayısı", "karakter say"]);
            if (content) return this.charCount(content);
        }

        return null;
    }

    _extractContent(text, phrases) {
        let cleaned = String(text || "");
        for (const p of phrases) {
            cleaned = cleaned.replace(new RegExp(p, "gi"), " ");
        }
        cleaned = cleaned.replace(/^[^a-zçğıöşü0-9]+/i, "").trim();
        return cleaned.length >= 3 ? cleaned : null;
    }

}

module.exports = new TextApi();
