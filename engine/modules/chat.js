"use strict";

class Chat{

    async run(engine,prompt){

        return await engine.ai.ask(prompt);

    }

}

module.exports=new Chat();
