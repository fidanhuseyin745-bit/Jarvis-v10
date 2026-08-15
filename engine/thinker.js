"use strict";

const Coder=require("../ai/coder");

class Thinker{

    constructor(){

        this.ai=new Coder();

    }

    async intent(prompt){

        prompt=prompt.toLowerCase();

        if(prompt.includes("haber"))
            return "NEWS";

        if(prompt.includes("bugün"))
            return "NEWS";

        if(prompt.includes("dolar"))
            return "MARKET";

        if(prompt.includes("altın"))
            return "MARKET";

        if(prompt.includes("borsa"))
            return "MARKET";

        if(prompt.includes("bitcoin"))
            return "MARKET";

        if(prompt.includes("kod"))
            return "CODE";

        if(prompt.includes("youtube"))
            return "PHONE";

        if(prompt.includes("chrome"))
            return "PHONE";

        if(prompt.includes("aç"))
            return "PHONE";

        return "CHAT";

    }

    async answer(context){

        return await this.ai.ask(context.prompt);

    }

}

module.exports=Thinker;
