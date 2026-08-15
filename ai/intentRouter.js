"use strict";

const phoneAgent=require("../agents/phoneAgent");
const ai=require("./aiManager");

class IntentRouter{

    async execute(plan,input){

        switch(plan.intent){

            case "PHONE":
                return await phoneAgent.run(input);

            case "NEWS":

                console.log("🌍 İnternette araştırılıyor...\n");

                console.log(await ai.ask(
                    "Güncel haberlere göre şu soruyu cevapla:\n\n"+input
                ));

                return true;

            case "CODE":

                console.log(await ai.ask(input));

                return true;

            case "CHAT":
            default:

                console.log(await ai.ask(input));

                return true;

        }

    }

}

module.exports=new IntentRouter();
