"use strict";

const axios = require("axios");

/**
 * NumbersSkill — NumbersAPI (anahtar gerektirmez).
 * "42 sayısı hakkında" gibi matematiksel/tarihsel bilgi verir.
 */
module.exports = {
    name: "Numbers",

    match(text) {
        return /sayısı|sayisi|hakkında bilgi|matematik/i.test(text) && /\d/.test(text);
    },

    async run(input) {
        const m = input.match(/(\d+)/);
        if (!m) return "Hangi sayı?";
        const n = m[1];
        try {
            const res = await axios.get("http://numbersapi.com/" + n + "/tr", {
                timeout: 8000
            });
            return "🔢 " + res.data;
        } catch (e) {
            return "Sayı bilgisi alınamadı: " + e.message;
        }
    }
};
