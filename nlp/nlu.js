"use strict";

class NLU {

    constructor() {
        this.questionTypes = {
            definition: ["nedir", "ne demek", "ne demektir", "açıkla", "anlat", "tanımı", "tanımı nedir"],
            person: ["kimdir", "kimdir o", "kim olduğunu"],
            method: ["nasıl", "şekilde", "yöntem", "nasıl yapılır"],
            reason: ["neden", "niçin", "niye", "sebep"],
            location: ["nerede", "nerde", "neresinde", "nerde bulunur", "neresi", "neresidir"],
            time: ["ne zaman", "hangi tarihte", "kaç yılında"],
            quantity: ["kaç", "miktar", "sayısı", "adedi", "ne kadar", "yüksekliği", "uzunluğu", "ağırlığı", "sıcaklığı"],
            comparison: ["karşılaştır", "farkı", "fark nedir", "hangisi daha"]
        };
    }

    normalize(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/[?¿!.,;:]/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    tokenize(text) {
        return this.normalize(text).split(" ").filter(Boolean);
    }

    detectQuestionType(text) {
        const lower = this.normalize(text);

        for (const [type, words] of Object.entries(this.questionTypes)) {
            for (const w of words) {
                if (lower.includes(w)) {
                    return type;
                }
            }
        }

        if (lower.endsWith("midir") || lower.endsWith("mıdır") ||
            lower.endsWith("mudur") || lower.endsWith("müdür")) {
            return "definition";
        }

        return null;
    }

    extractSubject(text) {
        const lower = this.normalize(text);

        let cleaned = lower;

        const allQWords = Object.values(this.questionTypes).flat();
        for (const w of allQWords) {
            cleaned = cleaned.replace(new RegExp("\\b" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "g"), " ");
        }

        const fillers = ["bir", "bu", "şu", "o", "ile", "ve", "için", "hakkında",
                        "hakkinda", "the", "a", "an", "mı", "mi",
                        "mıdır", "midir", "kadar"];
        for (const f of fillers) {
            cleaned = cleaned.replace(new RegExp("\\b" + f + "\\b", "g"), " ");
        }

        cleaned = cleaned.replace(/\s+/g, " ").trim();

        const words = cleaned.split(" ").filter(w => w.length > 2);
        if (!words.length) return null;

        return words.slice(0, 4).join(" ");
    }

    extractEntities(text) {
        const lower = this.normalize(text);
        const entities = [];

        const numbers = lower.match(/\d+(?:[.,]\d+)?/g);
        if (numbers) {
            entities.push({ type: "number", values: numbers });
        }

        const years = lower.match(/\b(19|20)\d{2}\b/g);
        if (years) {
            entities.push({ type: "year", values: years });
        }

        const units = ["kg", "gram", "ton", "km", "metre", "cm", "mm",
                       "saat", "dakika", "saniye", "litre", "derece", "yıl",
                       "ay", "gün", "hafta"];
        const found = units.filter(u => lower.includes(u));
        if (found.length) {
            entities.push({ type: "unit", values: found });
        }

        return entities;
    }

    similarity(a, b) {
        if (!a || !b) return 0;
        const wa = this.tokenize(a);
        const wb = this.tokenize(b);
        if (!wa.length || !wb.length) return 0;

        const setA = new Set(wa);
        const setB = new Set(wb);

        let common = 0;
        for (const w of setA) {
            if (setB.has(w)) common++;
        }

        return common / Math.max(wa.length, wb.length);
    }

    analyze(text) {
        return {
            raw: String(text || ""),
            normalized: this.normalize(text),
            tokens: this.tokenize(text),
            questionType: this.detectQuestionType(text),
            subject: this.extractSubject(text),
            entities: this.extractEntities(text)
        };
    }

}

module.exports = new NLU();
