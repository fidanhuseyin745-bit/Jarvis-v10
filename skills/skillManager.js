"use strict";

const fs = require("fs");
const path = require("path");

/**
 * SkillManager: skills/ dizinindeki tüm skill'leri otomatik
 * yükler ve gelen isteğe göre en uygun olanı seçer.
 * Skill'ler dosya adı sırasına göre kontrol edilir; ilk
 * eşleşen döndürülür.
 */
class SkillManager {

    constructor() {
        this.skills = [];
        this.loaded = false;
    }

    load() {
        if (this.loaded) return;
        this.loaded = true;

        const dir = __dirname;
        let files = [];
        try {
            files = fs.readdirSync(dir);
        } catch (e) {
            this.skills = [];
            return;
        }

        this.skills = [];

        for (const file of files) {
            if (file === "skillManager.js") continue;
            if (!file.endsWith(".js")) continue;

            try {
                const skill = require(path.join(dir, file));
                if (skill && skill.name && typeof skill.match === "function" && typeof skill.run === "function") {
                    this.skills.push(skill);
                }
            } catch (e) {
                console.log("❌ skill yüklenemedi:", file, e.message);
            }
        }
    }

    list() {
        this.load();
        return this.skills.map(s => s.name);
    }

    async find(input) {
        this.load();
        const text = String(input || "");
        for (const skill of this.skills) {
            try {
                if (skill.match(text)) return skill;
            } catch (e) {
                /* bir skill patlarsa diğerleri denensin */
            }
        }
        return null;
    }

    async runSkill(name, input) {
        this.load();
        const skill = this.skills.find(s => s.name === name);
        if (!skill) return null;
        return await skill.run(input);
    }
}

module.exports = new SkillManager();
