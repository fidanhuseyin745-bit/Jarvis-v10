"use strict";

const LocalEngine = require("./localEngine");

class JarvisAI {

    constructor() {
        this.engine = new LocalEngine();
    }

    async ask(prompt, context) {
        return await this.engine.ask(prompt, context);
    }

}

module.exports = JarvisAI;
