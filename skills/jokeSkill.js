"use strict";

const axios = require("axios");

/**
 * JokeSkill — JokeAPI (anahtar gerektirmez).
 * "şaka yap", "esprili bir şey söyle" isteklerini yanıtlar.
 */
module.exports = {
    name: "Joke",

    match(text) {
        return /şaka|espr(i|ı)|fıkra|joke|güldür/i.test(text);
    },

    async run() {
        try {
            const res = await axios.get("https://v2.jokeapi.dev/joke/Any", {
                params: { lang: "tr", safe: true, type: "twopart,single" },
                timeout: 8000
            });
            const d = res.data || {};
            if (d.error) return "Şaka alınamadı.";
            if (d.type === "twopart") {
                return "😄 Şaka:\n" + d.setup + "\n\n" + d.delivery;
            }
            return "😄 Şaka:\n" + d.joke;
        } catch (e) {
            return "Şaka sorgusu başarısız: " + e.message;
        }
    }
};
