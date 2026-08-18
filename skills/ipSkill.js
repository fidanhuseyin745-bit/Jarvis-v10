"use strict";

const axios = require("axios");

/**
 * IpSkill — ipapi.co (anahtar gerektirmez).
 * "ip adresim", "ip bilgim" isteklerini yanıtlar.
 */
module.exports = {
    name: "IP",

    match(text) {
        return /\bip\b|ip adres|ip bilg|ipim/i.test(text);
    },

    async run() {
        try {
            const res = await axios.get("https://ipapi.co/json/", {
                timeout: 8000,
                headers: { "User-Agent": "JarvisBot/1.0" }
            });
            const d = res.data || {};
            if (d.error) return "IP bilgisi alınamadı: " + (d.reason || "");
            return "🌐 IP bilgisi:\n" +
                "IP: " + (d.ip || "-") + "\n" +
                "Şehir: " + (d.city || "-") + "\n" +
                "Bölge: " + (d.region || "-") + "\n" +
                "Ülke: " + (d.country_name || "-") + "\n" +
                "ISP: " + (d.org || "-");
        } catch (e) {
            return "IP sorgusu başarısız: " + e.message;
        }
    }
};
