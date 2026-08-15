"use strict";

const engine=require("../engine");

class Jarvis{

    async execute(input){

        try{

            const answer=await engine.reply(input);

            if(answer)
                console.log("\n🤖 "+answer+"\n");

        }catch(e){

            console.log("\n❌ "+e.message+"\n");

        }

    }

}

module.exports=new Jarvis();
