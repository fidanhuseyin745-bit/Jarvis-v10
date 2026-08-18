"use strict";

const axios = require("axios");

/**
 * CurrencySkill — Frankfurter API (ECB döviz kurları, anahtar gerektirmez).
 * "dolar ne kadar", "euro kuru", "dolar tl" gibi istekleri yanıtlar.
 */
module.exports = {
    name: "Currency",

    match(text) {
        return /dolar|euro|döviz|doviz|kuru|sterlin|pound|usd|eur|gbp/i.test(text);
    },

    async run(input) {
        const base = this._extractBase(input);
        const data = await this._rates(base);
        if (!data.success) return data.error;

        const lines = ["💱 " + base + " kurları:"];
        const targets = ["TRY", "EUR", "USD", "GBP"].filter(c => c !== base);
        for (const t of targets) {
            if (data.rates[t]) {
                lines.push("1 " + base + " = " + data.rates[t].toFixed(4) + " " + t);
            }
        }
        return lines.join("\n");
    },

    _extractBase(input) {
        if (/dolar|usd/i.test(input)) return "USD";
        if (/euro|eur/i.test(input)) return "EUR";
        if (/sterlin|pound|gbp/i.test(input)) return "GBP";
        return "USD";
    },

    async _rates(base) {
        try {
            const res = await axios.get("https://api.frankfurter.app/latest", {
                params: { from: base },
                timeout: 8000
            });
            if (!res.data || !res.data.rates) {
                return { success: false, error: "Kur verisi alınamadı." };
            }
            return { success: true, rates: res.data.rates, date: res.data.date };
        } catch (e) {
            return { success: false, error: "Döviz sorgusu başarısız: " + e.message };
        }
    }
};
