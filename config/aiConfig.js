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

module.exports = {
    url,
    model,
    key
};
