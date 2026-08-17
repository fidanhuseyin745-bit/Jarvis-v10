"use strict";

const axios = require("axios");
const aiConfig = require("../config/aiConfig");

class ReasoningAI {

    async generate(question, report) {
        if (!report || !report.best || report.best.length === 0)
            return null;

        if (!aiConfig.isConfigured)
            return null;

        let facts = "";

        report.best.forEach((x, i) => {
            facts += (i + 1) + ". " + x.text + "\n";
        });

        const prompt = `
Soru:
${question}

Bilgiler:
${facts}

Yalnızca bu bilgileri kullanarak kısa ve doğal bir cevap yaz.
`;

        const headers = { "Content-Type": "application/json" };
        if (aiConfig.key) {
            headers.Authorization = `Bearer ${aiConfig.key}`;
        }

        try {

            const res = await axios.post(
                aiConfig.url,
                {
                    model: aiConfig.model,
                    messages: [
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                },
                {
                    timeout: 30000,
                    headers
                }
            );

            if (!res.data || !res.data.choices || !res.data.choices.length)
                return null;

            return res.data.choices[0].message.content;

        } catch (err) {

            if (process.env.DEBUG === "true") {
                console.log("ReasoningAI hatası: " + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
            }

            return null;

        }

    }

}

module.exports = new ReasoningAI();
