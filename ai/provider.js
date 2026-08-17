"use strict";

const JarvisAI = require("./jarvisAI");

class Provider {

    constructor() {
        this.jarvis = new JarvisAI();
    }

    async ask(prompt, context) {
        return await this.jarvis.ask(prompt, context);
    }

}

module.exports = new Provider();
