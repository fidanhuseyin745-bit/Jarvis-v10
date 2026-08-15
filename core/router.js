"use strict";

const skillManager=require("../skills/skillManager");
const ai=require("../ai/aiManager");

class Router{

    constructor(){

        skillManager.load();

    }

    async run(task){

        const input=task.raw||task.input||task.text||"";

        const skill=await skillManager.find(input);

        if(skill){

            console.log("🧩 Skill:",skill.name);

            const reply=await skill.run(input);

            if(reply)
                console.log("\n"+reply+"\n");

            return true;

        }

        console.log("🤖 Genel AI kullanılıyor...\n");

        const reply=await ai.ask(input);

        console.log(reply);

        return true;

    }

}

module.exports=new Router();
