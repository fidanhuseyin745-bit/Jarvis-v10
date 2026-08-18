"use strict";

const axios = require("axios");

/**
 * TranslateSkill — MyMemory API (anahtar gerektirmez, günlük limitli).
 * "merhaba'yı ingilizceye çevir" gibi istekleri yanıtlar.
 */
const LANG_MAP = {
    "ingilizce": "en", "english": "en", "en": "en",
    "türkçe": "tr", "turkce": "tr", "turkish": "tr", "tr": "tr",
    "almanca": "de", "german": "de", "de": "de",
    "fransızca": "fr", "fransizca": "fr", "french": "fr", "fr": "fr",
    "ispanyolca": "es", "spanish": "es", "es": "es",
    "italyanca": "it", "italian": "it", "it": "it",
    "rusça": "ru", "rusca": "ru", "russian": "ru", "ru": "ru",
    "arapça": "ar", "arapca": "ar", "arabic": "ar", "ar": "ar",
    "japonca": "ja", "japanese": "ja", "ja": "ja"
};

module.exports = {
    name: "Translate",

    match(text) {
        return /çevir|translate|çeviri|ingilizceye|almancaya|fransızcaya/i.test(text);
    },

    async run(input) {
        const parsed = this._parse(input);
        const data = await this._translate(parsed.text, parsed.source, parsed.target);
        if (!data.success) return data.error;
        return "🌐 " + parsed.target.toUpperCase() + " çeviri:\n" + data.translation;
    },

    _parse(input) {
        let target = "en";
        for (const key of Object.keys(LANG_MAP)) {
            const re = new RegExp(key + "ya?\\b|" + key + "'?(?:e|ya)\\s+(?:çevir)", "i");
            if (re.test(input)) { target = LANG_MAP[key]; break; }
        }
        const m = input.match(/['"]([^'"]+)['"]/);
        let text = m ? m[1] : input.replace(/çevir|translate|ingilizceye|almancaya|[a-zçğıöşü]+ya?\s+çevir/gi, "").trim();
        if (!text) text = input;
        return { text, source: "tr", target };
    },

    async _translate(text, source, target) {
        try {
            const res = await axios.get("https://api.mymemory.translated.net/get", {
                params: { q: text, langpair: source + "|" + target },
                timeout: 8000
            });
            const t = res.data && res.data.responseData && res.data.responseData.translatedText;
            if (!t) return { success: false, error: "Çeviri alınamadı." };
            return { success: true, translation: t };
        } catch (e) {
            return { success: false, error: "Çeviri sorgusu başarısız: " + e.message };
        }
    }
};
