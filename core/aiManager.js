"use strict";

const axios = require("axios");
require("dotenv").config();

const memory = require("./conversationMemory");
const cache = require("./cache");
const stats = require("./apiStats");

class AIManager {

    constructor() {
        this.url = process.env.AI_API_URL || "";
        this.key = process.env.AI_API_KEY || "";
        this.model = process.env.AI_MODEL || "jarvis";
    }

    chooseModel(messages){
        const txt = JSON.stringify(messages).toLowerCase();

        if(txt.length > 800)
            return process.env.AI_MODEL_SMART || this.model;

        if(txt.includes("kod") || txt.includes("code"))
            return process.env.AI_MODEL_SMART || this.model;

        return process.env.AI_MODEL_FAST || this.model;
    }

    async chat(messages, options = {}){

        stats.calls++;

        messages = memory.build(messages);

        const cacheKey = JSON.stringify(messages);

        const cached = cache.get(cacheKey);

        if(cached)
            return cached;

        const response = await axios.post(
            this.url,
            {
                model: this.chooseModel(messages),
                messages,
                ...options
            },
            {
                headers:{
                    Authorization:`Bearer ${this.key}`
                }
            }
        );

        cache.set(cacheKey,response.data);

        return response.data;

    }

    stopServer(){}

}

module.exports = AIManager;
