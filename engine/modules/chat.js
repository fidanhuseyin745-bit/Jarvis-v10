"use strict";

class Chat{

    async run(engine,prompt,context){

        return await engine.ai.ask(prompt,context);

    }

}

module.exports=new Chat();
