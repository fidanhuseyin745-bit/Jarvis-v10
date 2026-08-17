"use strict";

const axios = require("axios");
const config = require("../config/aiConfig");

class Coder {

    async ask(prompt) {

        if (!config.isConfigured) {
            return this.offlineReply(prompt);
        }

        const headers = { "Content-Type": "application/json" };

        if (config.key) {
            headers.Authorization = `Bearer ${config.key}`;
        }

        try {

            const res = await axios.post(
                config.url,
                {
                    model: config.model,
                    messages: [
                        {
                            role: "user",
                            content: String(prompt || "")
                        }
                    ],
                    stream: false
                },
                {
                    timeout: config.timeout,
                    headers
                }
            );

            if (
                !res.data ||
                !res.data.choices ||
                !res.data.choices.length
            ) {
                return "AI cevap vermedi.";
            }

            return res.data.choices[0].message.content;

        } catch (err) {

            if (err.response) {
                return "AI Hatası: " + JSON.stringify(err.response.data);
            }

            return "Bağlantı Hatası: " + err.message;

        }

    }

    offlineReply(prompt) {
        return "⚠️ AI yapılandırılmamış. .env dosyasına AI_API_URL ve AI_API_KEY ekleyin. "
            + "Örnek için .env.example dosyasına bakın.\n\n"
            + "Girdi: " + String(prompt || "").slice(0, 200);
    }

}

module.exports = Coder;
