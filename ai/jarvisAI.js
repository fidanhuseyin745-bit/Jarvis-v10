"use strict";

const axios = require("axios");
const config = require("../config/aiConfig");

class JarvisAI {

    async ask(prompt) {

        if (!config.url) {

            throw new Error(
                "AI_API_URL tanımlı değil."
            );

        }

        const headers = {
            "Content-Type": "application/json"
        };

        if (config.key) {
            headers.Authorization =
                `Bearer ${config.key}`;
        }

        const res = await axios.post(
            config.url,
            {
                model: config.model,
                messages: [
                    {
                        role: "user",
                        content: String(prompt || "")
                    }
                ]
            },
            {
                headers,
                timeout: 60000
            }
        );

        return (
            res.data?.choices?.[0]?.message?.content ||
            ""
        );

    }

}

module.exports = JarvisAI;
