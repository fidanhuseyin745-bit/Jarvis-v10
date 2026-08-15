"use strict";

const Brain=require("./brain");
const Memory=require("./memory");
const Coder=require("../ai/coder");

class Engine{

    constructor(){

        this.ai=new Coder();

        this.memory=new Memory();

    }

    async reply(prompt){

        prompt=String(prompt||"").trim();

        if(!prompt)
            return "Bir şey yazmadın.";

        return await Brain.think(this,prompt);

    }

}

module.exports=new Engine();
