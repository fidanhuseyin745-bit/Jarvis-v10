"use strict";

require("dotenv").config();

const JarvisAI=require("./jarvisAI");

class Provider{

    constructor(){

        this.provider=(process.env.AI_PROVIDER||"jarvis").toLowerCase();

        this.jarvis=new JarvisAI();

    }

    async ask(prompt){

        switch(this.provider){

            case "jarvis":
                return await this.jarvis.ask(prompt);

            default:
                return await this.jarvis.ask(prompt);

        }

    }

}

module.exports=new Provider();
