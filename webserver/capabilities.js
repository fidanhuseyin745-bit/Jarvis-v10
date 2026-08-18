"use strict";

/**
 * Tüm yetenekleri tek bir yerden toplayan facade.
 * webserver ve CLI ortak bu nesneyi kullanır.
 */
const skillManager = require("../skills/skillManager");
const ai = require("../ai/aiManager");
const webAgent = require("../agents/webAgent");
const config = require("../config/config");

const capabilities = {
    listSkills() {
        return skillManager.list();
    },

    async runSkill(input) {
        const skill = await skillManager.find(input);
        if (!skill) return { matched: false };
        const reply = await skill.run(input);
        return { matched: true, skill: skill.name, reply };
    },

    async chat(input) {
        return await ai.chatSafe([{ role: "user", content: String(input || "") }]);
    },

    isAIConfigured() {
        return !ai.isOffline();
    },

    async webSearch(query) {
        return await webAgent.search(query);
    },

    async dispatch(input) {
        const skillResult = await this.runSkill(input);
        if (skillResult.matched) return skillResult;
        const reply = await this.chat(input);
        return { matched: false, reply };
    },

    async listSkillsAsync() {
        return skillManager.list();
    },

    meta() {
        return {
            version: config.version,
            name: config.name,
            aiConfigured: this.isAIConfigured(),
            skills: this.listSkills()
        };
    }
};

module.exports = capabilities;
