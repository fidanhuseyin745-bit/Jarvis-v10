"use strict";

const axios = require("axios");
const config = require("../config/aiConfig");

const SYSTEM_PROMPT = require("../engine/prompt");

/**
 * OpenAI uyumlu /chat/completions uç noktalarını destekler.
 * Tek seferlik `ask` ve çok mesajlı `chat` arayüzü sunar.
 * AI uç noktası tanımlı değilse anlamlı bir hata döner,
 * böylece üst katman (aiManager) zarif biçimde geri düşebilir.
 */
class JarvisAI {

    isConfigured() {
        return Boolean(config.url);
    }

    async chat(messages, options = {}) {

        if (!this.isConfigured()) {
            throw new Error("AI uç noktası tanımlı değil (AI_API_URL/AI_URL).");
        }

        const headers = {
            "Content-Type": "application/json"
        };

        if (config.key) {
            headers.Authorization = `Bearer ${config.key}`;
        }

        const payload = {
            model: options.model || config.model || "jarvis-chat",
            messages,
            stream: false
        };

        if (options.max_tokens) payload.max_tokens = options.max_tokens;
        if (options.temperature !== undefined) payload.temperature = options.temperature;

        const res = await axios.post(config.url, payload, {
            headers,
            timeout: options.timeout || 60000
        });

        return res.data?.choices?.[0]?.message?.content || "";
    }

    async ask(prompt, options = {}) {

        const messages = [
            { role: "system", content: String(SYSTEM_PROMPT).trim() },
            { role: "user", content: String(prompt || "") }
        ];

        return await this.chat(messages, options);
    }

}

module.exports = JarvisAI;
