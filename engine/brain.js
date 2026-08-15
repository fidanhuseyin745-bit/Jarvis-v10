"use strict";

const decision=require("./decisionEngine");
const executor=require("./executor");

class Brain{

    async think(engine,prompt){

        const brain=decision.decide(prompt);

        if(process.env.DEBUG==="true"){

            console.log("\n=== DECISION ===");
            console.log(JSON.stringify(brain,null,2));

        }

        return await executor.run(
            engine,
            prompt,
            brain
        );

    }

}

module.exports=new Brain();
