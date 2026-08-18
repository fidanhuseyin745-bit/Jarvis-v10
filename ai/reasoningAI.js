"use strict";

const axios = require("axios");
const aiConfig = require("../config/aiConfig");
const systemPrompt = require("./prompt");

/**
 * ReasoningAI: toplanan bilgileri sentezleyerek cevap üretir.
 * AI uç noktası yoksa null döner; bu durumda summarizer devreye girer.
 */
class ReasoningAI {

    isConfigured() {
        return Boolean(aiConfig.url);
    }

    async generate(question, report) {

        if (!this.isConfigured()) return null;

        if (!report || !report.best || report.best.length === 0)
            return null;

        let facts = "";
        report.best.forEach((x, i) => {
            facts += (i + 1) + ". " + x.text + "\n";
        });

        const prompt =
            "Soru:\n" + question +
            "\n\nBilgiler:\n" + facts +
            "\nYalnızca bu bilgileri kullanarak kısa ve doğal bir cevap yaz.";

        const headers = { "Content-Type": "application/json" };
        if (aiConfig.key) headers.Authorization = `Bearer ${aiConfig.key}`;

        try {
            const res = await axios.post(aiConfig.url, {
                model: aiConfig.model || "jarvis-chat",
                messages: [
                    { role: "system", content: String(systemPrompt).trim() },
                    { role: "user", content: prompt }
                ],
                stream: false
            }, { headers, timeout: 30000 });
            return res.data?.choices?.[0]?.message?.content || null;
        } catch (err) {
            console.log("AI ERROR:", err.response?.data || err.message);
            return null;
        }
    }
}

module.exports = new ReasoningAI();
