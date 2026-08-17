"use strict";

const fs = require("fs");
const path = require("path");

const builtin = require("./builtinFacts");

class KnowledgeBase {

    constructor() {
        this.dir = path.join(__dirname, "data");
        this.factsFile = path.join(this.dir, "facts.json");
        this.learnedFile = path.join(this.dir, "learned.json");

        if (!fs.existsSync(this.factsFile)) {
            builtin.install(this.dir);
        }

        this.facts = {};
        this.learned = {};

        this._load();
    }

    _load() {
        try {
            this.facts = JSON.parse(fs.readFileSync(this.factsFile, "utf8"));
        } catch {
            this.facts = {};
        }

        try {
            this.learned = JSON.parse(fs.readFileSync(this.learnedFile, "utf8"));
        } catch {
            this.learned = [];
        }
    }

    _saveLearned() {
        try {
            fs.mkdirSync(this.dir, { recursive: true });
            fs.writeFileSync(this.learnedFile, JSON.stringify(this.learned, null, 2));
        } catch {
        }
    }

    search(query) {
        const q = String(query || "").toLowerCase().trim();
        if (!q) return null;

        for (const key of Object.keys(this.facts)) {
            if (q.includes(key)) {
                return this.facts[key];
            }
        }

        for (const entry of this.learned) {
            const keys = (entry.keys || []).map(k => k.toLowerCase());
            for (const k of keys) {
                if (k && q.includes(k)) {
                    return { text: entry.response, type: "learned" };
                }
            }
        }

        const scored = [];
        for (const entry of this.learned) {
            const pattern = String(entry.pattern || "").toLowerCase();
            const words = pattern.split(/\s+/).filter(w => w.length > 2);

            let hits = 0;
            for (const w of words) {
                if (q.includes(w)) hits++;
            }

            if (hits > 0) {
                scored.push({ entry, score: hits / Math.max(words.length, 1) });
            }
        }

        scored.sort((a, b) => b.score - a.score);

        if (scored.length && scored[0].score >= 0.4) {
            return { text: scored[0].entry.response, type: "learned" };
        }

        return null;
    }

    learn(pattern, response) {
        if (!pattern || !response) return;

        const words = String(pattern).toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 2)
            .slice(0, 3);

        this.learned.push({
            pattern: String(pattern).toLowerCase().trim(),
            keys: words,
            response: String(response),
            time: Date.now()
        });

        if (this.learned.length > 200) {
            this.learned.shift();
        }

        this._saveLearned();
    }

    forget() {
        this.learned = [];
        this._saveLearned();
    }

    list() {
        return {
            builtin: Object.keys(this.facts).length,
            learned: this.learned.length
        };
    }

}

module.exports = new KnowledgeBase();
