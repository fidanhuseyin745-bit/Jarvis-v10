"use strict";

const provider=require("./provider");
const context=require("./contextManager");

class AIManager{

    async ask(prompt){

        context.add(prompt);

        console.log("🧠 AI düşünüyor...");

        const reply=await provider.ask(prompt);

        return reply;

    }

}

module.exports=new AIManager();
