"use strict";

require("dotenv").config();

const url =
    process.env.AI_API_URL ||
    process.env.AI_URL ||
    "";

const model =
    process.env.AI_MODEL ||
    process.env.MODEL ||
    "jarvis-chat";

const key =
    process.env.AI_API_KEY ||
    "";

const timeout = parseInt(process.env.AI_TIMEOUT, 10) || 60000;

function isValidUrl(value) {
    if (!value) return false;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

module.exports = {
    url,
    model,
    key,
    timeout,
    isConfigured: isValidUrl(url)
};
