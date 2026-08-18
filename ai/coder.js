"use strict";

require("dotenv").config();
const axios = require("axios");
const aiConfig = require("../config/aiConfig");
const systemPrompt = require("./prompt");

/**
 * Coder: kod üretimi / analiz / düzeltme için kullanılan
 * dar amaçlı AI arayüzü. AI uç noktası yoksa zarif biçimde
 * boş/uygun yanıtlar döndürür.
 */
class Coder {

    isConfigured() {
        return Boolean(aiConfig.url);
    }

    async ask(prompt, options = {}) {
        if (!this.isConfigured()) {
            return "AI uç noktası tanımlı değil (AI_API_URL/AI_URL).";
        }

        const headers = { "Content-Type": "application/json" };
        if (aiConfig.key) headers.Authorization = `Bearer ${aiConfig.key}`;

        const payload = {
            model: options.model || aiConfig.model || "jarvis-chat",
            messages: [
                { role: "system", content: String(systemPrompt).trim() },
                { role: "user", content: String(prompt || "") }
            ],
            stream: false
        };
        if (options.max_tokens) payload.max_tokens = options.max_tokens;
        if (options.temperature !== undefined) payload.temperature = options.temperature;

        try {
            const res = await axios.post(aiConfig.url, payload, {
                timeout: options.timeout || 60000,
                headers
            });
            return res.data?.choices?.[0]?.message?.content || "";
        } catch (err) {
            if (err.response) {
                return "AI Hatası: " + JSON.stringify(err.response.data);
            }
            return "Bağlantı Hatası: " + err.message;
        }
    }

    async generate(prompt) {
        return await this.ask(
            "Profesyonel, temiz ve çalışan kod yaz.\n\n" + String(prompt || "")
        );
    }

    async analyze(project) {
        return await this.ask(
            "Şu projeyi analiz et ve mimari öneriler ver:\n\n" + String(project || "")
        );
    }

    async fix(project) {
        return await this.ask(
            "Şu projedeki olası hataları tespit et ve düzeltme öner:\n\n" + String(project || "")
        );
    }

    async generateReadme(projectDir) {
        const fs = require("fs");
        const path = require("path");
        let overview = "";
        try {
            overview = fs.readdirSync(projectDir).slice(0, 30).join(", ");
        } catch (e) { /* yoksay */ }
        const reply = await this.ask(
            "Şu proje için kısa bir README.md içeriği üret (Markdown). " +
            "Dosyalar: " + overview
        );
        try {
            fs.writeFileSync(path.join(projectDir, "README.md"), reply);
            return { success: true, file: "README.md" };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

module.exports = Coder;
