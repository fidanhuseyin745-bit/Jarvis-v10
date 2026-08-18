"use strict";

require("dotenv").config();

const JarvisAI = require("./jarvisAI");

const OFFLINE_MSG =
    "⚠️ AI uç noktası tanımlı değil. .env içine AI_API_URL/AI_URL ve AI_MODEL/MODEL ekleyerek "
    + "yapay zekayı aktif edebilirsin. ";

/**
 * Provider: gerçek AI uç noktası tanımlıysa onu kullanır,
 * tanımlı değilse (offline) Jarvis yine de skill'ler ve
 * karar motoru üzerinden çalışır — sadece serbest sohbet kısıtlanır.
 */
class Provider {

    constructor() {
        this.provider = (process.env.AI_PROVIDER || "jarvis").toLowerCase();
        this.jarvis = new JarvisAI();
        this.offline = !this.jarvis.isConfigured();
    }

    isOffline() {
        return this.offline;
    }

    async ask(prompt) {
        return await this.chat(
            [{ role: "user", content: String(prompt || "") }]
        );
    }

    async chat(messages, options = {}) {
        switch (this.provider) {
            case "jarvis":
            default:
                return await this.jarvis.chat(messages, options);
        }
    }

    /**
     * AI çağrısı başarısız olursa çağıran taraf zarif biçimde
     * işleyebilsin diye hata yerine string döndürür.
     */
    async chatSafe(messages, options = {}) {
        if (this.offline) {
            return OFFLINE_MSG;
        }
        try {
            return await this.chat(messages, options);
        } catch (err) {
            const detail = err.response
                ? JSON.stringify(err.response.data)
                : err.message;
            return "AI çağrısı başarısız oldu: " + detail;
        }
    }

    async askSafe(prompt) {
        return await this.chatSafe(
            [{ role: "user", content: String(prompt || "") }],
            {}
        );
    }
}

module.exports = new Provider();
