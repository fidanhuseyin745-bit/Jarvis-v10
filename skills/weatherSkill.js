"use strict";

const axios = require("axios");

/**
 * WeatherSkill — Open-Meteo (anahtar gerektirmez).
 * Şehir adını önce geocoding ile koordinata çevirir,
 * sonra güncel hava durumunu getirir.
 */
module.exports = {
    name: "Weather",

    match(text) {
        return /hava (durumu|nasıl)|hava durumu|hava/.test(text);
    },

    async run(input) {
        const city = this._extractCity(input);
        const geo = await this._geocode(city);
        if (!geo.success) return geo.error;

        const res = await axios.get("https://api.open-meteo.com/v1/forecast", {
            params: {
                latitude: geo.lat,
                longitude: geo.lon,
                current_weather: true,
                timezone: "auto"
            },
            timeout: 8000
        });

        const cw = res.data && res.data.current_weather;
        if (!cw) return "Hava durumu verisi alınamadı.";

        return "🌤️ " + geo.name + " hava durumu:\n" +
            "Sıcaklık: " + cw.temperature + "°C\n" +
            "Rüzgar: " + cw.windspeed + " km/s\n" +
            "Zaman: " + cw.time;
    },

    _extractCity(input) {
        const m = input.match(/(?:hava|weather)\s+(?:durumu?\s+)?(?:için\s+)?(.+)/i);
        let city = m ? m[1].trim() : "";
        city = city.replace(/[?.!]/g, "").trim();
        if (!city) city = "İstanbul";
        return city;
    },

    async _geocode(city) {
        try {
            const res = await axios.get("https://geocoding-api.open-meteo.com/v1/search", {
                params: { name: city, count: 1, language: "tr" },
                timeout: 8000
            });
            const place = res.data && res.data.results && res.data.results[0];
            if (!place) return { success: false, error: "'" + city + "' için konum bulunamadı." };
            return {
                success: true,
                name: place.name + (place.country ? ", " + place.country : ""),
                lat: place.latitude,
                lon: place.longitude
            };
        } catch (e) {
            return { success: false, error: "Konum sorgusu başarısız: " + e.message };
        }
    }
};
