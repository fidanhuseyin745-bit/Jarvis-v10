"use strict";

const ai=require("../ai/aiManager");

module.exports={

    name:"News",

    match(text){

        return text.includes("haber")
            ||text.includes("gündem")
            ||text.includes("dünyada")
            ||text.includes("son gelişme");

    },

    async run(input){

        return await ai.ask(
            "En güncel ve doğru bilgilerle cevap ver:\n\n"+input
        );

    }

};
