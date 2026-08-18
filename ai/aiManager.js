"use strict";

const provider = require("./provider");
const context = require("./contextManager");

/**
 * AIManager: Jarvis'ın merkezi yapay zeka arayüzü.
 *  - ask(prompt): tek seferlik soru (sistem promptu dahil)
 *  - chat(messages, opts): çok mesajlı sohbet (orchestrator/architect/reviewer kullanır)
 *  - chatSafe: hata fırlatmadan string döndürür
 *  - offline: AI uç noktası yoksa bile skill/executor yolunu bozmaz
 */
class AIManager {

    constructor() {
        this.provider = provider;
        this.offline = provider.isOffline();
    }

    async ask(prompt, options = {}) {
        context.add(prompt);
        const reply = await this.provider.ask(prompt, options);
        context.add(reply);
        return reply;
    }

    /**
     * AI uç noktası tanımlı değilse veya çağrı patlarsa
     * hata yerine standart bir metin döndürür. orchestrator /
     * architect gibi JSON bekleyen çağrılar bunu ayrıştırır.
     */
    async chatSafe(messages, options = {}) {
        return await this.provider.chatSafe(messages, options);
    }

    async chat(messages, options = {}) {
        return await this.provider.chat(messages, options);
    }

    isOffline() {
        return this.offline;
    }
}

module.exports = new AIManager();
