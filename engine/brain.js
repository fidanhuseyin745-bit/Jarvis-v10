"use strict";

const decision = require("./decisionEngine");
const executor = require("./executor");
const knowledge = require("../knowledge/knowledgeBase");

class Brain {

    async think(engine, prompt, context) {

        const brain = decision.decide(prompt);

        if (process.env.DEBUG === "true") {
            console.log("\n=== DECISION ===");
            console.log(JSON.stringify(brain, null, 2));
        }

        if (this._isLocal(prompt)) {
            brain.plan = [["chat", 200]];
        }

        return await executor.run(
            engine,
            prompt,
            brain,
            context
        );

    }

    _isLocal(prompt) {
        const lower = String(prompt || "").toLowerCase();

        if (knowledge.search(lower)) {
            return true;
        }

        if (/^[\d+\-*/.()\s]+$/.test(lower) && /[+\-*/]/.test(lower.replace(/\s/g, ""))) {
            return true;
        }

        const localTriggers = ["saat kaç", "saat ne", "bugün", "tarih", "hangi gün",
                               "merhaba", "selam", "naber", "günaydın", "iyi akşamlar",
                               "teşekkür", "sağ ol", "eyvallah", "hoşçakal", "görüşürüz",
                               "neler yapabilirsin", "yardım", "öğret", "unut", "nasılsın"];
        return localTriggers.some(t => lower.includes(t));
    }

}

module.exports = new Brain();
