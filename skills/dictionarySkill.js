"use strict";

const axios = require("axios");

/**
 * DictionarySkill — Free Dictionary API (anahtar gerektirmez).
 * "run kelimesinin anlamı" gibi istekleri yanıtlar.
 */
module.exports = {
    name: "Dictionary",

    match(text) {
        return /anlamı|anlami|kelime|sözlük|sozluk|dictionary|define/i.test(text);
    },

    async run(input) {
        const word = this._extractWord(input);
        if (!word) return "Hangi kelime?";
        const data = await this._define(word);
        if (!data.success) return data.error;

        const lines = ["📖 " + word + " (" + data.phonetic + ")"];
        data.meanings.slice(0, 3).forEach(m => {
            lines.push("• [" + m.partOfSpeech + "]");
            m.definitions.slice(0, 2).forEach(d => {
                lines.push("  - " + d.definition);
            });
        });
        return lines.join("\n");
    },

    _extractWord(input) {
        const m = input.match(/([a-zA-Z]+)/);
        if (m && !/anlamı|anlami|kelime|sözlük|sozluk|dictionary|define/i.test(m[1])) {
            return m[1].toLowerCase();
        }
        const m2 = input.match(/([a-zA-Z]+)/g);
        return m2 ? m2[m2.length - 1].toLowerCase() : null;
    },

    async _define(word) {
        try {
            const res = await axios.get("https://api.dictionaryapi.dev/api/v2/entries/en/" + encodeURIComponent(word), {
                timeout: 8000
            });
            const entry = res.data && res.data[0];
            if (!entry) return { success: false, error: "'" + word + "' için tanım bulunamadı." };
            return {
                success: true,
                phonetic: entry.phonetic || (entry.phonetics && entry.phonetics[0] && entry.phonetics[0].text) || "-",
                meanings: entry.meanings || []
            };
        } catch (e) {
            if (e.response && e.response.status === 404) {
                return { success: false, error: "'" + word + "' için tanım bulunamadı." };
            }
            return { success: false, error: "Sözlük sorgusu başarısız: " + e.message };
        }
    }
};
