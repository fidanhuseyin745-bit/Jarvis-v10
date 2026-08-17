"use strict";

class Research{

    async run(engine,prompt,context){

        return await engine.ai.ask(
            "Konuyu derinlemesine araştır:\n\n"+prompt,
            context
        );

    }

}

module.exports=new Research();
