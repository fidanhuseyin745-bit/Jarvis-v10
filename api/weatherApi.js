"use strict";

const http = require("./httpClient");

class WeatherApi {

    constructor() {
        this.base = "https://wttr.in/";
    }

    async getWeather(location) {
        const loc = String(location || "").trim();
        if (!loc) return null;

        const url = this.base + encodeURIComponent(loc) + "?format=j1&lang=tr";

        try {
            const data = await http.getJson(url, { timeout: 8000 });
            if (!data || !data.current_condition) return null;

            const cur = data.current_condition[0];
            const tempC = cur.temp_C;
            const desc = this._trDesc(cur.weatherDesc, cur.lang_tr);
            const feels = cur.FeelsLikeC;
            const humidity = cur.humidity;
            const area = data.nearest_area && data.nearest_area[0];

            const lines = [
                "🌤️ " + (area ? area.areaName[0].value : loc) + " hava durumu:",
                "• Sıcaklık: " + tempC + "°C (hissedilen " + feels + "°C)",
                "• Durum: " + desc,
                "• Nem: %" + humidity
            ];

            if (data.weather && data.weather[0]) {
                const today = data.weather[0];
                lines.push("• Bugün: " + today.mintempC + "°C / " + today.maxtempC + "°C");
            }

            return lines.join("\n");
        } catch {
            return null;
        }
    }

    _trDesc(weatherDesc, langTr) {
        if (langTr && langTr[0] && langTr[0].value) return langTr[0].value;
        if (weatherDesc && weatherDesc[0] && weatherDesc[0].value) return weatherDesc[0].value;
        return "bilinmiyor";
    }

    detect(text) {
        const lower = String(text || "").toLowerCase();
        if (lower.includes("hava durumu") || lower.includes("hava nasıl") ||
            lower.includes("hava kaç derece") || lower.includes("sıcaklık kaç")) {
            const m = text.match(/(?:hava durumu|hava nasıl|hava kaç derece|sıcaklık kaç)[:\s]*(?:İstanbul'da|Ankara'da|İzmir'de|istanbul|ankara|izmir|bursa|antalya|[a-zçğıöşü]+)\b/i);
            const locMatch = text.match(/(?:istanbul|ankara|izmir|bursa|antalya|adana|konya|gaziantep|kayseri|eskişehir)/i);
            if (locMatch) return { type: "weather", location: locMatch[0] };
            return { type: "weather", location: "istanbul" };
        }
        return null;
    }

}

module.exports = new WeatherApi();
