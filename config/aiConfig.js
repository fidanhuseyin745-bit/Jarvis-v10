"use strict";

require("dotenv").config();

/*
 * Jarvis v10 artık tamamen yerel çalışır — dış AI API'si yoktur.
 * Bu yapılandırma yalnızca geriye dönük uyumluluk için tutulur;
 * aktif kod yolu config.url / config.key kullanmaz.
 */

const model = process.env.AI_MODEL || "jarvis-local";
const timeout = parseInt(process.env.AI_TIMEOUT, 10) || 60000;

module.exports = {
    url: "",
    model,
    key: "",
    timeout,
    isConfigured: false
};
