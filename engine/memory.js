"use strict";

const fs = require("fs");
const path = require("path");

class Memory {

    constructor() {
        this.file = path.join(__dirname, "memory.json");
        this.maxItems = 50;
    }

    loadAll() {
        try {
            return JSON.parse(fs.readFileSync(this.file, "utf8"));
        } catch {
            return [];
        }
    }

    async load() {
        return this.loadAll();
    }

    async save(prompt, reply) {
        try {
            const data = this.loadAll();
            data.push({ prompt, reply, time: Date.now() });
            while (data.length > this.maxItems)
                data.shift();
            fs.writeFileSync(this.file, JSON.stringify(data, null, 2));
        } catch (err) {
            if (process.env.DEBUG === "true")
                console.log("Memory kayıt hatası: " + err.message);
        }
    }

    async recent(limit = 6) {
        const data = this.loadAll();
        return data.slice(-limit);
    }

}

module.exports = Memory;
