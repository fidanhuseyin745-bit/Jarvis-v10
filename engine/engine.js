"use strict";

const Brain=require("./brain");
const Memory=require("./memory");
const Coder=require("../ai/coder");

class Engine {

    constructor() {
        this.ai = new Coder();
        this.memory = new Memory();
    }

    async reply(prompt) {
        prompt = String(prompt || "").trim();
        if (!prompt) return "Bir şey yazmadın.";

        const recent = await this.memory.recent(6);
        const context = { recent };

        const answer = await Brain.think(this, prompt, context);

        await this.memory.save(prompt, answer);

        return answer;
    }

}

module.exports=new Engine();
