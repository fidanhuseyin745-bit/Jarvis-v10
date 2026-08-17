"use strict";

const fs = require("fs");
const path = require("path");

const builtin = require("./builtinFacts");

class KnowledgeBase {

    constructor() {
        this.dir = path.join(__dirname, "data");
        this.factsFile = path.join(this.dir, "facts.json");
        this.learnedFile = path.join(this.dir, "learned.json");
        this.datasetsDir = path.join(__dirname, "datasets");

        if (!fs.existsSync(this.factsFile)) {
            builtin.install(this.dir);
        }

        this.facts = {};
        this.learned = [];

        this._load();
        this._loadDatasets();
    }

    _loadDatasets() {
        let added = 0;
        try {
            const files = fs.readdirSync(this.datasetsDir)
                .filter(f => f.endsWith(".json"));

            for (const file of files) {
                try {
                    const data = JSON.parse(
                        fs.readFileSync(path.join(this.datasetsDir, file), "utf8")
                    );
                    for (const key of Object.keys(data)) {
                        if (!this.facts[key]) {
                            this.facts[key] = { text: data[key], type: "dataset" };
                            added++;
                        }
                    }
                } catch {
                }
            }
        } catch {
        }
    }

    _load() {
        try {
            this.facts = JSON.parse(fs.readFileSync(this.factsFile, "utf8"));
            for (const key of Object.keys(this.facts)) {
                if (typeof this.facts[key] === "string") {
                    this.facts[key] = { text: this.facts[key], type: "builtin" };
                }
            }
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

        const reverseKeys = Object.keys(this.facts)
            .filter(k => k.includes(q))
            .sort((a, b) => a.length - b.length);
        if (reverseKeys.length) {
            return this.facts[reverseKeys[0]];
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
        for (const key of Object.keys(this.facts)) {
            const words = key.split(/\s+/).filter(w => w.length > 2);
            let hits = 0;
            for (const w of words) {
                if (q.includes(w)) hits++;
            }
            if (hits > 0) {
                scored.push({ key, score: hits / Math.max(words.length, 1) });
            }
        }

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

        if (scored.length && scored[0].score >= 0.5) {
            if (scored[0].key) {
                return this.facts[scored[0].key];
            }
            if (scored[0].entry) {
                return { text: scored[0].entry.response, type: "learned" };
            }
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
