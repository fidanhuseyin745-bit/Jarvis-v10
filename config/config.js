"use strict";

require("dotenv").config();

const aiConfig = require("./aiConfig");

module.exports = {
    name: "Jarvis",
    version: "10.0",
    debug: process.env.DEBUG === "true",
    internet: true,
    memory: true,
    tools: true,
    maxHistory: 20,
    aiUrl: aiConfig.url || process.env.AI_URL || process.env.AI_API_URL,
    model: aiConfig.model || process.env.MODEL || process.env.AI_MODEL
};
