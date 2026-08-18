"use strict";

const knowledge = require("../knowledge/knowledgeBase");

class Inference {

    constructor() {
        this.relations = [
            { trigger: "başkenti", target: "başkent", extract: (subj) => this._lookupCapital(subj) },
            { trigger: "başkent", target: "başkent", extract: (subj) => this._lookupCapital(subj) },
            { trigger: "nüfusu", target: "population", extract: (subj) => this._lookupPopulation(subj) },
            { trigger: "nüfus", target: "population", extract: (subj) => this._lookupPopulation(subj) },
            { trigger: "para birimi", target: "currency", extract: (subj) => this._lookupCurrency(subj) },
            { trigger: "resmi dili", target: "language", extract: (subj) => this._lookupLanguage(subj) },
            { trigger: "dili", target: "language", extract: (subj) => this._lookupLanguage(subj) },
            { trigger: "yüzölçümü", target: "area", extract: (subj) => this._lookupField(subj, "yüzölçümü") },
            { trigger: "kuruluş", target: "founding", extract: (subj) => this._lookupField(subj, "kuruluş") },
            { trigger: "doğum", target: "birth", extract: (subj) => this._lookupField(subj, "doğum") },
            { trigger: "ölüm", target: "death", extract: (subj) => this._lookupField(subj, "ölüm") }
        ];
    }

    resolve(text) {
        const lower = String(text || "").toLowerCase();

        for (const rel of this.relations) {
            if (lower.includes(rel.trigger)) {
                const subject = this._extractSubjectFor(lower, rel.trigger);
                if (subject) {
                    const result = rel.extract(subject);
                    if (result) {
                        return { relation: rel.trigger, subject, value: result };
                    }
                }
            }
        }

        return null;
    }

    _extractSubjectFor(text, trigger) {
        let cleaned = text;

        cleaned = cleaned.replace(new RegExp(trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), " ");
        cleaned = cleaned.replace(/\b(nedir|neresi|nerede|kaç|ne kadar|mıdır|midir|mi|mı|nedir)\b/g, " ");
        cleaned = cleaned.replace(/\b(bir|bu|şu|o|ile|ve|için|hakkında|the|a|an)\b/g, " ");
        cleaned = cleaned.replace(/\s+/g, " ").trim();

        const words = cleaned.split(" ").filter(w => w.length > 2);
        if (!words.length) return null;
        return words.slice(0, 4).join(" ");
    }

    _lookupCapital(subject) {
        const s = subject.toLowerCase();

        const directMap = {
            "türkiye": "Ankara",
            "türkiyenin": "Ankara",
            "abd": "Washington D.C.",
            "amerika": "Washington D.C.",
            "rusya": "Moskova",
            "çin": "Pekin (Beijing)",
            "japonya": "Tokyo",
            "almanya": "Berlin",
            "fransa": "Paris",
            "ingiltere": "Londra",
            "italya": "Roma",
            "ispanya": "Madrid",
            "hindistan": "Yeni Delhi",
            "brezilya": "Brasilia",
            "kanada": "Ottawa",
            "avustralya": "Canberra",
            "mısır": "Kahire",
            "yunanistan": "Atina",
            "iran": "Tahran",
            "irak": "Bağdat",
            "suudi arabistan": "Riyad",
            "suudi": "Riyad"
        };

        for (const key of Object.keys(directMap)) {
            if (s.includes(key)) return directMap[key];
        }

        const entry = knowledge.search(subject + " başkenti");
        if (entry && entry.text) {
            const m = entry.text.match(/başkenti?\s+([A-Za-zçğıöşüÇĞİÖŞÜ]+)/i);
            if (m) return m[1];
        }

        return null;
    }

    _lookupPopulation(subject) {
        const entry = knowledge.search(subject);
        if (entry && entry.text) {
            const m = entry.text.match(/nüfusu[^.]*?~?(\d+[.,]?\d*\s*(?:milyon|milyar|bin)?)/i);
            if (m) return m[0];
        }
        return null;
    }

    _lookupCurrency(subject) {
        const directMap = {
            "türkiye": "Türk Lirası (TRY, ₺)",
            "abd": "ABD Doları (USD)",
            "amerika": "ABD Doları (USD)",
            "rusya": "Rus Rublesi (RUB)",
            "çin": "Çin Yuanı (CNY)",
            "japonya": "Japon Yeni (JPY)",
            "almanya": "Euro (EUR)",
            "fransa": "Euro (EUR)",
            "italya": "Euro (EUR)",
            "ispanya": "Euro (EUR)",
            "ingiltere": "İngiliz Sterlini (GBP)"
        };

        const s = subject.toLowerCase();
        for (const key of Object.keys(directMap)) {
            if (s.includes(key)) return directMap[key];
        }

        const entry = knowledge.search(subject);
        if (entry && entry.text) {
            const m = entry.text.match(/para birimi[^.]*?([^.]+)/i);
            if (m) return m[0];
        }
        return null;
    }

    _lookupLanguage(subject) {
        const directMap = {
            "türkiye": "Türkçe",
            "abd": "İngilizce",
            "amerika": "İngilizce",
            "rusya": "Rusça",
            "çin": "Mandarin Çincesi",
            "japonya": "Japonca",
            "almanya": "Almanca",
            "fransa": "Fransızca",
            "italya": "İtalyanca",
            "ispanya": "İspanyolca",
            "ingiltere": "İngilizce"
        };

        const s = subject.toLowerCase();
        for (const key of Object.keys(directMap)) {
            if (s.includes(key)) return directMap[key];
        }

        const entry = knowledge.search(subject);
        if (entry && entry.text) {
            const m = entry.text.match(/resmi dili?\s+([^.]+)/i);
            if (m) return m[0];
        }
        return null;
    }

    _lookupField(subject, field) {
        const entry = knowledge.search(subject + " " + field);
        if (entry && entry.text) {
            return entry.text;
        }
        return null;
    }

}

module.exports = new Inference();
