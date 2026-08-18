"use strict";

const axios = require("axios");

/**
 * CryptoSkill — CoinGecko public API (anahtar gerektirmez).
 * "bitcoin fiyatı", "ethereum ne kadar" gibi istekleri yanıtlar.
 */
module.exports = {
    name: "Crypto",

    match(text) {
        return /bitcoin|ethereum|kripto|btc|eth|solana|coin/i.test(text);
    },

    async run(input) {
        const coin = this._extractCoin(input);
        const data = await this._price(coin);
        if (!data.success) return data.error;

        return "₿ " + coin.toUpperCase() + " (" + data.name + ")\n" +
            "USD: $" + this._fmt(data.usd) + "\n" +
            "TRY: ₺" + this._fmt(data.try) + "\n" +
            "24s değişim: " + (data.change >= 0 ? "+" : "") + data.change.toFixed(2) + "%";
    },

    _extractCoin(input) {
        const map = {
            "bitcoin": "bitcoin", "btc": "bitcoin",
            "ethereum": "ethereum", "ether": "ethereum", "eth": "ethereum",
            "solana": "solana", "sol": "solana",
            "cardano": "cardano", "ada": "cardano",
            "dogecoin": "dogecoin", "doge": "dogecoin",
            "binance": "binancecoin", "bnb": "binancecoin",
            "ripple": "ripple", "xrp": "ripple"
        };
        for (const key of Object.keys(map)) {
            if (new RegExp("\\b" + key + "\\b", "i").test(input)) return map[key];
        }
        return "bitcoin";
    },

    async _price(coin) {
        try {
            const res = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
                params: { ids: coin, vs_currencies: "usd,try", include_24hr_change: "true" },
                timeout: 8000
            });
            const d = res.data && res.data[coin];
            if (!d) return { success: false, error: "Coin verisi bulunamadı." };
            return {
                success: true,
                name: coin,
                usd: d.usd,
                try: d.try,
                change: d.usd_24h_change || 0
            };
        } catch (e) {
            return { success: false, error: "Kripto sorgusu başarısız: " + e.message };
        }
    },

    _fmt(n) {
        if (n >= 1) return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
        return String(n);
    }
};
