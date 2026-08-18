"use strict";

const LocalEngine = require("./localEngine");

class Coder {

    constructor() {
        this.engine = new LocalEngine();
    }

    async ask(prompt, context) {
        return await this.engine.ask(prompt, context);
    }

    async learn(pattern, response) {
        await this.engine.learn(pattern, response);
    }

}

module.exports = Coder;
