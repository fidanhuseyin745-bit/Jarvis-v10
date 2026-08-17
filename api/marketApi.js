"use strict";

const http = require("./httpClient");

class MarketApi {

    constructor() {
        this.coingecko = "https://api.coingecko.com/api/v3";
        this.cache = { data: null, time: 0 };
        this.cacheTtl = 60000;
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();
        const coins = ["bitcoin", "btc", "ethereum", "eth", "ripple", "xrp",
                       "litecoin", "ltc", "dogecoin", "doge", "binance", "bnb",
                       "cardano", "ada", "solana", "sol", "tether", "usdt"];
        const found = coins.find(c => lower.includes(c));
        if (found && (lower.includes("fiyat") || lower.includes("ne kadar") ||
            lower.includes("kaç") || lower.includes("değer") || lower.includes("price"))) {
            return { type: "crypto", coin: found };
        }

        const forex = ["dolar", "euro", "sterlin", "yen", "dolar kuru", "euro kuru"];
        const f = forex.find(c => lower.includes(c));
        if (f && (lower.includes("kaç") || lower.includes("ne kadar") || lower.includes("kuru"))) {
            return { type: "forex", currency: f };
        }

        return null;
    }

    async getCryptoPrice(coinId) {
        const id = this._resolveCoinId(coinId);
        if (!id) return null;

        const url = this.coingecko + "/simple/price?ids=" + id + "&vs_currencies=usd,try&include_24hr_change=true";

        try {
            const data = await http.getJson(url, { timeout: 8000 });
            if (!data || !data[id]) return null;

            const info = data[id];
            const usd = info.usd;
            const tryPrice = info.try;
            const change = info.usd_24h_change;

            const lines = [
                "📈 " + this._coinLabel(coinId) + " fiyatı:",
                "• $" + this._fmt(usd),
                "• ₺" + this._fmt(tryPrice),
                "• 24s değişim: " + (change >= 0 ? "+" : "") + change.toFixed(2) + "%"
            ];
            return lines.join("\n");
        } catch {
            return null;
        }
    }

    _resolveCoinId(coin) {
        const map = {
            "bitcoin": "bitcoin", "btc": "bitcoin",
            "ethereum": "ethereum", "eth": "ethereum",
            "ripple": "ripple", "xrp": "ripple",
            "litecoin": "litecoin", "ltc": "litecoin",
            "dogecoin": "dogecoin", "doge": "dogecoin",
            "binance": "binancecoin", "bnb": "binancecoin",
            "cardano": "cardano", "ada": "cardano",
            "solana": "solana", "sol": "solana",
            "tether": "tether", "usdt": "tether"
        };
        return map[String(coin).toLowerCase()] || null;
    }

    _coinLabel(coin) {
        const labels = {
            "bitcoin": "Bitcoin (BTC)", "btc": "Bitcoin (BTC)",
            "ethereum": "Ethereum (ETH)", "eth": "Ethereum (ETH)",
            "ripple": "Ripple (XRP)", "xrp": "Ripple (XRP)",
            "litecoin": "Litecoin (LTC)", "ltc": "Litecoin (LTC)",
            "dogecoin": "Dogecoin (DOGE)", "doge": "Dogecoin (DOGE)",
            "binance": "Binance Coin (BNB)", "bnb": "Binance Coin (BNB)",
            "cardano": "Cardano (ADA)", "ada": "Cardano (ADA)",
            "solana": "Solana (SOL)", "sol": "Solana (SOL)",
            "tether": "Tether (USDT)", "usdt": "Tether (USDT)"
        };
        return labels[String(coin).toLowerCase()] || coin;
    }

    _fmt(n) {
        if (n >= 1000) return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
        if (n >= 1) return n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });
        return n.toLocaleString("tr-TR", { maximumFractionDigits: 6 });
    }

}

module.exports = new MarketApi();
