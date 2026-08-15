"use strict";

class Reasoning {

    async think(input) {

        const text = String(input || "").trim().toLowerCase();

        const plan = {
            intent: "CHAT",
            confidence: 0.50,
            steps: [],
            tools: []
        };

        if (text.includes("haber") ||
            text.includes("bugün") ||
            text.includes("son gelişme")) {

            plan.intent = "NEWS";
            plan.confidence = 0.95;
            plan.steps.push("İnterneti araştır");
            plan.steps.push("Kaynakları doğrula");
            plan.steps.push("Özet oluştur");
            plan.tools.push("search");
            plan.tools.push("ai");

            return plan;
        }

        if (text.includes("kod") ||
            text.includes("program") ||
            text.includes("javascript")) {

            plan.intent = "CODE";
            plan.confidence = 0.90;
            plan.steps.push("Kod analizi");
            plan.steps.push("Çözüm üret");
            plan.tools.push("ai");

            return plan;
        }

        if (text.includes("telefon") ||
            text.includes("uygulama") ||
            text.includes("aç")) {

            plan.intent = "PHONE";
            plan.confidence = 0.90;
            plan.steps.push("Telefon Agent");
            plan.tools.push("phone");

            return plan;
        }

        plan.steps.push("AI cevabı oluştur");
        plan.tools.push("ai");

        return plan;

    }

}

module.exports = new Reasoning();
