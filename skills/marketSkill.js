"use strict";

const ai=require("../ai/aiManager");

module.exports={

    name:"Market",

    match(text){

        return text.includes("bitcoin")
            ||text.includes("borsa")
            ||text.includes("altın")
            ||text.includes("dolar")
            ||text.includes("euro")
            ||text.includes("kripto");

    },

    async run(input){

        return await ai.ask(
            "Finans uzmanı gibi cevap ver.\n\n"+input
        );

    }

};
